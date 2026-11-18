<?php
/**
 * Shared reference-sheet pipeline.
 *
 * Both official artwork builders (main character, NPC lineup) cut their tiles
 * with these helpers, so every portrait is trimmed and framed the same way.
 * The artwork is never redrawn, recoloured or retouched — only cropped and
 * scaled onto a transparent canvas.
 */

/** Alpha of a single pixel, 0 (opaque) … 127 (clear). */
function alphaAt($im, $x, $y)
{
    return (imagecolorat($im, $x, $y) >> 24) & 127;
}

/** Tight bbox of pixels with alpha below $maxAlpha inside a region. */
function contentBox($im, $x0, $y0, $x1, $y1, $maxAlpha = 100)
{
    $minX = PHP_INT_MAX;
    $minY = PHP_INT_MAX;
    $maxX = -1;
    $maxY = -1;
    $x1 = min($x1, imagesx($im) - 1);
    $y1 = min($y1, imagesy($im) - 1);
    for ($y = max(0, $y0); $y <= $y1; $y++) {
        for ($x = max(0, $x0); $x <= $x1; $x++) {
            if (alphaAt($im, $x, $y) < $maxAlpha) {
                if ($x < $minX) $minX = $x;
                if ($x > $maxX) $maxX = $x;
                if ($y < $minY) $minY = $y;
                if ($y > $maxY) $maxY = $y;
            }
        }
    }
    if ($maxX < 0) return null;
    return [$minX, $minY, $maxX, $maxY];
}

/** Crop the source and leave $pad transparent pixels around the artwork. */
function cropTrimmed($im, $box, $pad)
{
    list($x0, $y0, $x1, $y1) = $box;
    $w = $x1 - $x0 + 1;
    $h = $y1 - $y0 + 1;
    $dst = imagecreatetruecolor($w + $pad * 2, $h + $pad * 2);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    $clear = imagecolorallocatealpha($dst, 0, 0, 0, 127);
    imagefill($dst, 0, 0, $clear);
    imagecopy($dst, $im, $pad, $pad, $x0, $y0, $w, $h);
    return $dst;
}

function resizeTo($src, $targetW, $targetH)
{
    $dst = imagecreatetruecolor($targetW, $targetH);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    imagefill($dst, 0, 0, imagecolorallocatealpha($dst, 0, 0, 0, 127));
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $targetW, $targetH, imagesx($src), imagesy($src));
    return $dst;
}

/** Fit artwork into a transparent canvas of the given size without cropping. */
function fitContain($src, $canvasW, $canvasH, $margin)
{
    $sw = imagesx($src);
    $sh = imagesy($src);
    $scale = min(($canvasW - $margin * 2) / $sw, ($canvasH - $margin * 2) / $sh);
    $w = (int)round($sw * $scale);
    $h = (int)round($sh * $scale);
    $dst = imagecreatetruecolor($canvasW, $canvasH);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    imagefill($dst, 0, 0, imagecolorallocatealpha($dst, 0, 0, 0, 127));
    imagecopyresampled($dst, $src, (int)(($canvasW - $w) / 2), (int)(($canvasH - $h) / 2), 0, 0, $w, $h, $sw, $sh);
    return $dst;
}

/**
 * Fill a canvas edge to edge, cropping the overflow from the centre.
 * Used for full-bleed portraits cut from a sheet that has no alpha channel.
 */
function fitCover($src, $canvasW, $canvasH)
{
    $sw = imagesx($src);
    $sh = imagesy($src);
    $scale = max($canvasW / $sw, $canvasH / $sh);
    $w = (int)round($sw * $scale);
    $h = (int)round($sh * $scale);
    $tmp = imagecreatetruecolor($w, $h);
    imagealphablending($tmp, false);
    imagesavealpha($tmp, true);
    imagefill($tmp, 0, 0, imagecolorallocatealpha($tmp, 0, 0, 0, 127));
    imagecopyresampled($tmp, $src, 0, 0, 0, 0, $w, $h, $sw, $sh);
    $dst = imagecreatetruecolor($canvasW, $canvasH);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    imagefill($dst, 0, 0, imagecolorallocatealpha($dst, 0, 0, 0, 127));
    imagecopy($dst, $tmp, (int)(($canvasW - $w) / 2), (int)(($canvasH - $h) / 2), 0, 0, $canvasW, $canvasH);
    return $dst;
}
