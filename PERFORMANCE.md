# Performance maintenance

Search and mobile-menu chunks download on first open and remain mounted for exit animations and focus/scroll-lock cleanup. Lenis loads only for desktop fine-pointer users without reduced-motion preferences. Journey and portfolio raster artwork uses responsive WebP instead of bypassing optimization.

Content raster assets belong in WebP. SVG logos/icons remain vector. Keep source images below 250 KiB; prefer below 80 KiB for cards and below 180 KiB for large photographs. Keep explicit image dimensions or existing aspect-ratio/container sizing to avoid layout shifts. Avoid re-encoding an already small source merely to change its quality.

Use `responsiveImage(src, sizes)` for existing img markup and an accurate `sizes` prop for next/image. All four image optimizers emit WebP. Illustration quality 90 preserves edges/alpha; ordinary photographs use quality 75 at the requested width. The lightweight srcset helper uses the default Next image width allowlist; update both if imageSizes/deviceSizes changes.

Set `NEXT_PUBLIC_PAYLOAD_URL` to the public CMS origin. It is the image optimizer's explicit remote host allowlist. Unconfigured third-party embeds, SVG/GIF and localhost CMS previews keep original URLs. No private-network image access is enabled. CMS media URLs carry updatedAt as a version so replacing an image refreshes the image cache after normal content revalidation.

Import named icons or specific icon modules. Do not import a complete icon namespace or a dynamic catalog. Lucide's named imports are optimized by Next; finite registries hold explicitly imported project icons. Keep content server rendered; defer optional engines/dialogs rather than replacing entire sections with blank placeholders.

Run `npm run audit:performance` after adding assets/icons. It checks public content-image formats, a 250 KiB per-image source budget and whole-catalog icon imports. Run `npm run build` and inspect a production preview after client-code changes. Development bundles/timings are not production measurements.

On this Windows/Node 24 environment the existing Turbopack build also crashed during finalization before these changes. Compilation, types and page generation succeeded; `node node_modules/next/dist/bin/next build --webpack` completed successfully. The existing deployment-specific Turbopack worker-thread configuration is preserved.
