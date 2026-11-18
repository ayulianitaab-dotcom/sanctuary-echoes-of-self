<?php
/**
 * Builds the official Main Character assets from the reference sheet.
 *
 * The sheet is cut on measured tile boundaries (alpha projections, not guesswork),
 * trimmed to the visible artwork and re-composited on a transparent canvas.
 * The artwork itself is never redrawn, recoloured or retouched.
 *
 *   php tools/build-main-assets.php
 */
require_once __DIR__ . '/lib/image-pipeline.php';

$root = dirname(__DIR__);
$sheetPath = $root . '/assets/characters/main/source-reference.webp';
$outDir = $root . '/assets/characters/main';
$exprDir = $outDir . '/expressions';
$debugDir = $root . '/.tmp-main-assets';

$sheet = imagecreatefromwebp($sheetPath);
if (!$sheet) {
    fwrite(STDERR, "cannot read $sheetPath\n");
    exit(1);
}
imagealphablending($sheet, false);
$W = imagesx($sheet);
$H = imagesy($sheet);

if (!is_dir($exprDir)) mkdir($exprDir, 0777, true);
if (!is_dir($debugDir)) mkdir($debugDir, 0777, true);
foreach (glob($exprDir . '/*.png') as $old) unlink($old);

/* ---------------- full body ---------------- */
$bodyBox = contentBox($sheet, 0, 0, 444, $H - 1);
if (!$bodyBox) {
    fwrite(STDERR, "full body not found\n");
    exit(1);
}
$body = cropTrimmed($sheet, $bodyBox, 12);
$bodyH = 800;
$bodyW = (int)round(imagesx($body) * ($bodyH / imagesy($body)));
$body = resizeTo($body, $bodyW, $bodyH);
imagepng($body, $outDir . '/fullbody.png', 9);
echo sprintf("fullbody.png  %dx%d  from %dx%d at (%d,%d)\n", $bodyW, $bodyH,
    $bodyBox[2] - $bodyBox[0] + 1, $bodyBox[3] - $bodyBox[1] + 1, $bodyBox[0], $bodyBox[1]);

/* ---------------- expression tiles ---------------- */
$rowBands = [[43, 320], [354, 625], [660, 924]];
$colBands = [[455, 705], [716, 979], [985, 1246], [1257, 1518]];

// visual order of the sheet → semantic names used by the game;
// null = alternate takes that ship with the sheet but are not used in game
$names = [
    [null, 'neutral', 'happy', null],
    ['surprised', null, 'sad', null],
    ['thinking', 'angry', 'embarrassed', 'thanking'],
];

// portrait canvas matches the dialogue portrait box closely, so no face or
// hair is ever cropped by object-fit
$portraitW = 336;
$portraitH = 420;

$i = 0;
foreach ($rowBands as $r => $rows) {
    foreach ($colBands as $c => $cols) {
        $box = contentBox($sheet, $cols[0] - 8, $rows[0] - 8, $cols[1] + 8, $rows[1] + 8);
        if (!$box) continue;
        $name = $names[$r][$c];
        if ($name === null) continue;
        $tile = cropTrimmed($sheet, $box, 14);
        $art = fitContain($tile, $portraitW, $portraitH, 12);
        imagepng($art, $exprDir . '/' . $name . '.png', 9);
        echo sprintf("expressions/%s.png  from %dx%d at (%d,%d)\n", $name,
            $box[2] - $box[0] + 1, $box[3] - $box[1] + 1, $box[0], $box[1]);
        $i++;
    }
}

/* ---------------- inspection sheet (lavender backdrop) ---------------- */
$files = glob($exprDir . '/*.png');
sort($files);
$cell = 320;
$colsN = 4;
$rowsN = (int)ceil(count($files) / $colsN) + 1;
$dbg = imagecreatetruecolor($cell * $colsN, $cell * $rowsN);
imagealphablending($dbg, true);
imagefill($dbg, 0, 0, imagecolorallocate($dbg, 150, 132, 178));
$font = 3;
$k = 0;
foreach ($files as $f) {
    $im = imagecreatefrompng($f);
    $x = ($k % $colsN) * $cell;
    $y = (int)floor($k / $colsN) * $cell;
    imagecopyresampled($dbg, $im, $x + 6, $y + 6, 0, 0, $cell - 12, $cell - 12, imagesx($im), imagesy($im));
    imagestring($dbg, $font, $x + 8, $y + 8, basename($f, '.png'), imagecolorallocate($dbg, 20, 10, 30));
    $k++;
}
$bodySmall = imagecreatefrompng($outDir . '/fullbody.png');
$y = (int)floor($k / $colsN) * $cell;
imagecopyresampled($dbg, $bodySmall, 0, $y, 0, 0, (int)(imagesx($bodySmall) * (($cell * 2 - 12) / imagesy($bodySmall))), $cell * 2 - 12, imagesx($bodySmall), imagesy($bodySmall));
imagepng($dbg, $debugDir . '/contact-sheet.png', 6);
echo "debug sheet: .tmp-main-assets/contact-sheet.png\n";
echo "tiles: $i\n";
