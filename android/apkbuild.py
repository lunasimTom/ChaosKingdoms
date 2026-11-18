#!/usr/bin/env python3
"""Minimal APK packer: binary AndroidManifest.xml + resources.arsc encoders and an
aligned (zipalign-equivalent) unsigned APK writer. No Android SDK required."""
import struct, sys, zipfile, zlib

PKG = 'com.chaoskingdoms.game'
VERSION_CODE = 25
VERSION_NAME = '2.5.0'
MIN_SDK, TARGET_SDK = 24, 34
APP_LABEL = 'Chaos Kingdoms'
ICON_PATH = 'res/drawable-xxxhdpi-v4/ic_launcher.png'
ID_ICON = 0x7F010000
ID_NAME = 0x7F020000

ANDROID_NS = 'http://schemas.android.com/apk/res/android'
ATTR = {  # verified against android.R$attr
    'theme': 0x01010000, 'label': 0x01010001, 'icon': 0x01010002, 'name': 0x01010003,
    'exported': 0x01010010, 'launchMode': 0x0101001d, 'screenOrientation': 0x0101001e,
    'configChanges': 0x0101001f, 'minSdkVersion': 0x0101020c, 'versionCode': 0x0101021b,
    'versionName': 0x0101021c, 'targetSdkVersion': 0x01010270, 'allowBackup': 0x01010280,
    'hardwareAccelerated': 0x010102d3, 'largeHeap': 0x0101035a,
}
T_REF, T_STR, T_DEC, T_HEX, T_BOOL = 0x01, 0x03, 0x10, 0x11, 0x12


def pad4(b):
    return b + b'\0' * (-len(b) % 4)


def string_pool(strings):
    """UTF-16 ResStringPool chunk."""
    offs, data = [], b''
    for s in strings:
        offs.append(len(data))
        u = s.encode('utf-16-le')
        n = len(u) // 2
        assert n < 0x8000
        data += struct.pack('<H', n) + u + b'\0\0'
    data = pad4(data)
    hdr = 28
    start = hdr + 4 * len(strings)
    body = b''.join(struct.pack('<I', o) for o in offs) + data
    return struct.pack('<HHIIIIII', 0x0001, hdr, hdr + len(body), len(strings), 0, 0, start, 0) + body


# ------------------------------------------------------------------ AndroidManifest.xml
def manifest():
    # element tree: (name, [(attr, type, value)], children)
    app_attrs = [('label', T_STR, APP_LABEL), ('icon', T_REF, ID_ICON), ('theme', T_REF, 0x0103000A),
                 ('allowBackup', T_BOOL, True), ('hardwareAccelerated', T_BOOL, True), ('largeHeap', T_BOOL, True)]
    act_attrs = [('name', T_STR, PKG + '.MainActivity'), ('label', T_STR, APP_LABEL), ('exported', T_BOOL, True),
                 ('launchMode', T_DEC, 2),            # singleTask
                 ('screenOrientation', T_DEC, 13),    # fullUser
                 ('configChanges', T_HEX, 0x1FF0)]    # keep the WebView alive across rotation/resizes
    tree = ('manifest', [('versionCode', T_DEC, VERSION_CODE), ('versionName', T_STR, VERSION_NAME),
                         ('package', T_STR, PKG, None)],
            [('uses-sdk', [('minSdkVersion', T_DEC, MIN_SDK), ('targetSdkVersion', T_DEC, TARGET_SDK)], []),
             ('application', app_attrs, [
                 ('activity', act_attrs, [
                     ('intent-filter', [], [
                         ('action', [('name', T_STR, 'android.intent.action.MAIN')], []),
                         ('category', [('name', T_STR, 'android.intent.category.LAUNCHER')], [])])])])])
    # string pool: attribute names with resource ids first (resource map aligns with them)
    attr_names = list(ATTR)
    strings = list(attr_names)
    def sidx(s):
        if s not in strings:
            strings.append(s)
        return strings.index(s)
    for s in ['android', ANDROID_NS, 'package']:
        sidx(s)
    body = []
    def walk(node):
        name, attrs, kids = node
        recs = []
        for a in attrs:
            an, t, v = a[0], a[1], a[2]
            ns = 0xFFFFFFFF if (len(a) > 3) else sidx(ANDROID_NS)
            nidx = sidx(an)
            if t == T_STR:
                raw = sidx(v); data = raw
            else:
                raw = 0xFFFFFFFF
                data = (0xFFFFFFFF if v else 0) if t == T_BOOL else v
            recs.append((ATTR.get(an, 0xFFFFFFFF), struct.pack('<IIIHBBI', ns, nidx, raw, 8, 0, t, data)))
        recs.sort(key=lambda r: r[0])  # framework walks attributes in resource-id order
        nm = sidx(name)
        el = struct.pack('<IIHHHHHH', 0xFFFFFFFF, nm, 20, 20, len(recs), 0, 0, 0) + b''.join(r[1] for r in recs)
        body.append(struct.pack('<HHIII', 0x0102, 16, 16 + len(el), 1, 0xFFFFFFFF) + el)
        for k in kids:
            walk(k)
        body.append(struct.pack('<HHIIIII', 0x0103, 16, 24, 1, 0xFFFFFFFF, 0xFFFFFFFF, nm))
    ns_start = lambda: struct.pack('<HHIIIII', 0x0100, 16, 24, 1, 0xFFFFFFFF, sidx('android'), sidx(ANDROID_NS))
    ns_end = lambda: struct.pack('<HHIIIII', 0x0101, 16, 24, 1, 0xFFFFFFFF, sidx('android'), sidx(ANDROID_NS))
    walk(tree)
    chunks = [ns_start()] + body + [ns_end()]
    pool = string_pool(strings)
    rmap = struct.pack('<HHI', 0x0180, 8, 8 + 4 * len(attr_names)) + b''.join(struct.pack('<I', ATTR[a]) for a in attr_names)
    payload = pool + rmap + b''.join(chunks)
    return struct.pack('<HHI', 0x0003, 8, 8 + len(payload)) + payload


# ------------------------------------------------------------------ resources.arsc
def arsc():
    gpool = string_pool([ICON_PATH, APP_LABEL])
    types = string_pool(['drawable', 'string'])
    keys = string_pool(['ic_launcher', 'app_name'])

    def spec(tid, n):
        return struct.pack('<HHIBBHI', 0x0202, 16, 16 + 4 * n, tid, 0, 0, n) + b'\0\0\0\0' * n

    def ttype(tid, entries, density=0):
        cfg = bytearray(64); struct.pack_into('<I', cfg, 0, 64); struct.pack_into('<H', cfg, 14, density)
        hdr = 20 + 64
        offs, data = b'', b''
        for key, vtype, vdata in entries:
            offs += struct.pack('<I', len(data))
            data += struct.pack('<HHI', 8, 0, key) + struct.pack('<HBBI', 8, 0, vtype, vdata)
        start = hdr + len(offs)
        return struct.pack('<HHIBBHII', 0x0201, hdr, start + len(data), tid, 0, 0, len(entries), start) + bytes(cfg) + offs + data

    type_chunks = spec(1, 1) + ttype(1, [(0, T_STR, 0)], density=640) + spec(2, 1) + ttype(2, [(1, T_STR, 1)])
    name = PKG.encode('utf-16-le').ljust(256, b'\0')
    phdr = 288
    type_off = phdr
    key_off = phdr + len(types)
    pkg_body = types + keys + type_chunks
    pkg = struct.pack('<HHII', 0x0200, phdr, phdr + len(pkg_body), 0x7F) + name + struct.pack('<IIIII', type_off, 2, key_off, 2, 0) + pkg_body
    payload = gpool + pkg
    return struct.pack('<HHII', 0x0002, 12, 12 + len(payload), 1) + payload


# ------------------------------------------------------------------ aligned zip
def write_apk(out, entries):
    """entries: list of (name, bytes, stored:bool, align:int)."""
    with zipfile.ZipFile(out, 'w') as z:
        for name, data, stored, align in entries:
            zi = zipfile.ZipInfo(name, date_time=(2026, 11, 18, 0, 0, 0))
            zi.create_system = 0
            zi.external_attr = 0
            if stored:
                zi.compress_type = zipfile.ZIP_STORED
                off = z.fp.tell() + 30 + len(name.encode())
                padn = (-off) % align
                zi.extra = b'\0' * padn if padn < 4 else struct.pack('<HH', 0xD935, padn - 4) + b'\0' * (padn - 4)
            else:
                zi.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(zi, data, compresslevel=9 if not stored else None)


if __name__ == '__main__':
    dex, icon, html, out = sys.argv[1:5]
    entries = [
        ('AndroidManifest.xml', manifest(), False, 4),
        ('classes.dex', open(dex, 'rb').read(), False, 4),
        ('resources.arsc', arsc(), True, 4),
        (ICON_PATH, open(icon, 'rb').read(), True, 4),
        ('assets/index.html', open(html, 'rb').read(), False, 4),
    ]
    write_apk(out, entries)
    print('unsigned apk ->', out)
