<?php
/* Publish-time packaging for deploy/public.
 *
 * The repository keeps the uploaded PNGs in assets/portraits as the source of
 * truth, but carrying all 27 MB of them into a deployment exceeds the host's
 * per-deploy allowance. This re-encodes exactly the same artwork to WebP for
 * the published copy only: same pixels, same dimensions, same transparency,
 * no cropping and no redrawing. index.html in deploy/public asks for .webp,
 * while the local build keeps using the original .png files.
 *
 * Usage: php tools/build-deploy-assets.php
 */

$root = dirname(__DIR__);
$src = $root . '/assets/portraits';
$out = $root . '/deploy/public/assets/portraits';

if (!is_dir($src)) {
    fwrite(STDERR, "ERROR: missing $src\n");
    exit(1);
}
if (!function_exists('imagewebp')) {
    fwrite(STDERR, "ERROR: this PHP build has no WebP support (imagewebp).\n");
    exit(1);
}

$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($src, FilesystemIterator::SKIP_DOTS)
);

$count = 0;
$inBytes = 0;
$outBytes = 0;

foreach ($files as $file) {
    if (strtolower($file->getExtension()) !== 'png') continue;

    $rel = substr($file->getPathname(), strlen($src) + 1);
    $rel = str_replace('\\', '/', $rel);
    $dest = $out . '/' . preg_replace('/\.png$/i', '.webp', $rel);
    if (!is_dir(dirname($dest)) && !mkdir(dirname($dest), 0777, true)) {
        fwrite(STDERR, "ERROR: cannot create " . dirname($dest) . "\n");
        exit(1);
    }

    $im = @imagecreatefrompng($file->getPathname());
    if (!$im) {
        fwrite(STDERR, "ERROR: cannot read $rel\n");
        exit(1);
    }
    imagealphablending($im, false);
    imagesavealpha($im, true);
    $ok = imagewebp($im, $dest, 82);
    imagedestroy($im);
    if (!$ok || !is_file($dest)) {
        fwrite(STDERR, "ERROR: cannot write $dest\n");
        exit(1);
    }

    $count++;
    $inBytes += filesize($file->getPathname());
    $outBytes += filesize($dest);
}

if ($count < 80) {
    fwrite(STDERR, "ERROR: expected at least 81 portrait files, packaged $count\n");
    exit(1);
}

printf(
    "Packaged %d portraits for the web: %.1f MB -> %.1f MB\n",
    $count,
    $inBytes / 1048576,
    $outBytes / 1048576
);

/* the title screen's painted village ships the same way: same pixels, WebP */
$bgSrc = $root . '/assets/backgrounds';
$bgOut = $root . '/deploy/public/assets/backgrounds';
$bg = glob($bgSrc . '/*.png');
if (!$bg) {
    fwrite(STDERR, "ERROR: no title background found in $bgSrc\n");
    exit(1);
}
if (!is_dir($bgOut) && !mkdir($bgOut, 0777, true)) {
    fwrite(STDERR, "ERROR: cannot create $bgOut\n");
    exit(1);
}
foreach ($bg as $file) {
    $dest = $bgOut . '/' . preg_replace('/\.png$/i', '.webp', basename($file));
    $im = @imagecreatefrompng($file);
    if (!$im) {
        fwrite(STDERR, "ERROR: cannot read " . basename($file) . "\n");
        exit(1);
    }
    $ok = imagewebp($im, $dest, 82);
    imagedestroy($im);
    if (!$ok || !is_file($dest)) {
        fwrite(STDERR, "ERROR: cannot write $dest\n");
        exit(1);
    }
    printf(
        "Packaged title background %s: %.1f MB -> %.1f MB\n",
        basename($dest),
        filesize($file) / 1048576,
        filesize($dest) / 1048576
    );
}

/* Mochi's full-body sprites ship the same way: the same pixels, WebP. The
 * character sheet is design reference only, so it never goes to the web. */
$mochiSrc = $root . '/assets/companions/mochi';
$mochiOut = $root . '/deploy/public/assets/companions/mochi';
$mochi = array_merge(
    glob($mochiSrc . '/expressions/*.png') ?: array(),
    glob($mochiSrc . '/poses/*.png') ?: array()
);
if (count($mochi) < 7) {
    fwrite(STDERR, "ERROR: expected 7 Mochi sprites in $mochiSrc, found " . count($mochi) . "\n");
    exit(1);
}
foreach ($mochi as $file) {
    $rel = str_replace('\\', '/', substr($file, strlen($mochiSrc) + 1));
    $dest = $mochiOut . '/' . preg_replace('/\.png$/i', '.webp', $rel);
    if (!is_dir(dirname($dest)) && !mkdir(dirname($dest), 0777, true)) {
        fwrite(STDERR, "ERROR: cannot create " . dirname($dest) . "\n");
        exit(1);
    }
    $im = @imagecreatefrompng($file);
    if (!$im) {
        fwrite(STDERR, "ERROR: cannot read " . basename($file) . "\n");
        exit(1);
    }
    imagealphablending($im, false);
    imagesavealpha($im, true);
    $ok = imagewebp($im, $dest, 86);
    imagedestroy($im);
    if (!$ok || !is_file($dest)) {
        fwrite(STDERR, "ERROR: cannot write $dest\n");
        exit(1);
    }
    printf("Packaged companion sprite %s: %.0f KB -> %.0f KB\n", $rel, filesize($file) / 1024, filesize($dest) / 1024);
}
if (!is_file($mochiOut . '/poses/idle.webp')) {
    fwrite(STDERR, "ERROR: companion packaging missing idle.webp\n");
    exit(1);
}

/* cinematic location plates: same pixels, WebP for the published copy. The
 * local build keeps the JPEGs, so the game works from disk with no server. */
$sceneSrc = $root . '/assets/scenes';
$sceneOut = $root . '/deploy/public/assets/scenes';
if (is_dir($sceneSrc)) {
    $sceneFiles = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($sceneSrc, FilesystemIterator::SKIP_DOTS)
    );
    $sceneCount = 0;
    foreach ($sceneFiles as $file) {
        $ext = strtolower($file->getExtension());
        if ($ext !== 'jpg' && $ext !== 'jpeg' && $ext !== 'png') continue;
        $rel = str_replace('\\', '/', substr($file->getPathname(), strlen($sceneSrc) + 1));
        $dest = $sceneOut . '/' . preg_replace('/\.(jpe?g|png)$/i', '.webp', $rel);
        if (!is_dir(dirname($dest)) && !mkdir(dirname($dest), 0777, true)) {
            fwrite(STDERR, "ERROR: cannot create " . dirname($dest) . "\n");
            exit(1);
        }
        $im = @imagecreatefromstring(file_get_contents($file->getPathname()));
        if (!$im) {
            fwrite(STDERR, "ERROR: cannot read scene art $rel\n");
            exit(1);
        }
        imagealphablending($im, false);
        imagesavealpha($im, true);
        $ok = imagewebp($im, $dest, 82);
        imagedestroy($im);
        if (!$ok || !is_file($dest)) {
            fwrite(STDERR, "ERROR: cannot write $dest\n");
            exit(1);
        }
        $sceneCount++;
    }
    printf("Packaged %d cinematic plates for the web\n", $sceneCount);
}