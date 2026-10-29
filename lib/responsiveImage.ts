// These widths are supported by Next's default deviceSizes/imageSizes.
// Keep this helper dependency-free: importing next/image into a client-only
// carousel otherwise downloads the image component runtime just for srcset.
const widths = [32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920];

export function responsiveImage(src: string | undefined, sizes = "(min-width: 1280px) 1200px, 100vw") {
  const original = { src };
  if (!src || /^(data:|blob:)/i.test(src) || /\.(svg|gif)(?:[?#]|$)/i.test(src)) return original;
  if (!src.startsWith("/") || src.startsWith("//")) {
    try {
      const image = new URL(src);
      const cms = new URL(process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3601");
      // Only the configured public CMS is optimized. Private previews and
      // third-party embeds keep their source; never broaden the host allowlist.
      if (image.origin !== cms.origin || ["localhost", "127.0.0.1", "[::1]"].includes(cms.hostname)) return original;
    } catch { return original; }
  }
  const url = encodeURIComponent(src);
  return {
    src,
    srcSet: widths.map(width => `/_next/image?url=${url}&w=${width}&q=75 ${width}w`).join(", "),
    sizes,
  };
}
