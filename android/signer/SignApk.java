import com.android.apksig.ApkSigner;
import com.android.apksig.ApkVerifier;
import java.io.*;
import java.security.*;
import java.security.cert.X509Certificate;
import java.util.*;

public class SignApk {
    public static void main(String[] a) throws Exception {
        String ks = a[0], pass = a[1], alias = a[2];
        File in = new File(a[3]), out = new File(a[4]);
        KeyStore k = KeyStore.getInstance("PKCS12");
        try (InputStream is = new FileInputStream(ks)) { k.load(is, pass.toCharArray()); }
        PrivateKey key = (PrivateKey) k.getKey(alias, pass.toCharArray());
        List<X509Certificate> certs = new ArrayList<>();
        for (java.security.cert.Certificate c : k.getCertificateChain(alias)) certs.add((X509Certificate) c);
        ApkSigner.SignerConfig sc = new ApkSigner.SignerConfig.Builder("CK", key, certs).build();
        new ApkSigner.Builder(Collections.singletonList(sc)).setInputApk(in).setOutputApk(out)
                .setMinSdkVersion(24).setV1SigningEnabled(false).setV2SigningEnabled(true).setCreatedBy("ChaosKingdoms build").build().sign();
        ApkVerifier.Result r = new ApkVerifier.Builder(out).build().verify();
        System.out.println("verified=" + r.isVerified() + " v1=" + r.isVerifiedUsingV1Scheme() + " v2=" + r.isVerifiedUsingV2Scheme());
        for (Object e : r.getErrors()) System.out.println("ERROR " + e);
        for (Object w : r.getWarnings()) System.out.println("WARN " + w);
        if (!r.isVerified()) System.exit(1);
    }
}
