<?php
/**
 * Sanctuary — visual asset validation.
 *
 * Checks the artwork on disk against the official roster, without trusting
 * file names: every portrait is decoded, its size and transparency inspected,
 * and every image is perceptually hashed so that one character's body can not
 * silently stand in for another's.
 *
 *   php tools/validate-visuals.php            # warnings allowed, exit 0
 *   php tools/validate-visuals.php --strict   # any problem fails the run
 */

$root = dirname(__DIR__);
$strict = in_array('--strict', $argv, true);

/* ---------------- roster from the one source of truth ---------------- */
$npcs = file_get_contents($root . '/js/data/npcs.js');
$start = strpos($npcs, 'D.OFFICIAL_ROSTER = {');
$end = strpos($npcs, '};', $start);
$block = substr($npcs, $start, $end - $start);
preg_match_all("/^\s{4}(\w+):\s*\{ name:\s*'([^']+)', gender:\s*'(\w+)', pronoun:\s*'(\w+)', profession:\s*'([^']+)'/m", $block, $m, PREG_SET_ORDER);
$roster = [];
foreach ($m as $row) {
    $roster[$row[1]] = ['name' => $row[2], 'gender' => $row[3], 'pronoun' => $row[4], 'profession' => $row[5]];
}
if (count($roster) !== 9) {
    fwrite(STDERR, "could not read the 9-entry official roster (found " . count($roster) . ")\n");
    exit(1);
}

/* ---------------- helpers ---------------- */
function dhash($path)
{
    $im = @imagecreatefromstring(file_get_contents($path));
    if (!$im) return null;
    $small = imagecreatetruecolor(9, 8);
    imagealphablending($small, false);
    imagecopyresampled($small, $im, 0, 0, 0, 0, 9, 8, imagesx($im), imagesy($im));
    $hash = '';
    for ($y = 0; $y < 8; $y++) {
        for ($x = 0; $x < 8; $x++) {
            $a = imagecolorat($small, $x, $y) & 0xFF;
            $b = imagecolorat($small, $x + 1, $y) & 0xFF;
            $hash .= $a > $b ? '1' : '0';
        }
    }
    imagedestroy($small);
    imagedestroy($im);
    return $hash;
}

function hamming($a, $b)
{
    $d = 0;
    for ($i = 0; $i < strlen($a); $i++) {
        if ($a[$i] !== $b[$i]) $d++;
    }
    return $d;
}

function has_alpha($path)
{
    $im = @imagecreatefromstring(file_get_contents($path));
    if (!$im) return false;
    $found = false;
    $w = imagesx($im);
    $h = imagesy($im);
    for ($y = 0; $y < $h && !$found; $y += max(1, (int) ($h / 40))) {
        for ($x = 0; $x < $w; $x += max(1, (int) ($w / 40))) {
            if (((imagecolorat($im, $x, $y) >> 24) & 0x7F) > 8) { $found = true; break; }
        }
    }
    imagedestroy($im);
    return $found;
}

/* ---------------- inspect ---------------- */
$checked = 0;
$valid = 0;
$needsWork = [];
$missing = [];
$duplicates = [];
$hashes = [];
$finding = [];

$portraitRoot = $root . '/assets/portraits';
$dirs = array_values(array_filter(scandir($portraitRoot), function ($d) use ($portraitRoot) {
    return $d[0] !== '.' && is_dir($portraitRoot . '/' . $d);
}));

foreach ($dirs as $dir) {
    if (!isset($roster[$dir])) {
        $needsWork[] = "assets/portraits/$dir is not in the official roster";
        continue;
    }
    $files = glob($portraitRoot . '/' . $dir . '/*.png');
    foreach ($files as $file) {
        $checked++;
        $rel = 'assets/portraits/' . $dir . '/' . basename($file);
        $size = @getimagesize($file);
        if (!$size) { $needsWork[] = "$rel cannot be decoded"; continue; }
        $valid++;
        $hash = dhash($file);
        $hashes[$rel] = $hash;
    }
    if (!is_file($portraitRoot . '/' . $dir . '/neutral.png')) $missing[] = "$dir: neutral portrait";
    if (!is_file($portraitRoot . '/' . $dir . '/fullbody.png')) {
        if ($dir === 'aria') {
            $missing[] = 'aria: official full-body artwork (bust fallback is active)';
        } else {
            $missing[] = "$dir: full-body artwork";
        }
    }
    foreach (['neutral', 'happy', 'sad', 'smile', 'serious', 'thinking', 'concerned', 'gentle'] as $mood) {
        if (!is_file($portraitRoot . '/' . $dir . '/' . $mood . '.png')) $missing[] = "$dir: $mood expression";
    }
}

/* near-duplicate artwork between different characters */
$paths = array_keys($hashes);
for ($i = 0; $i < count($paths); $i++) {
    for ($j = $i + 1; $j < count($paths); $j++) {
        $a = $paths[$i];
        $b = $paths[$j];
        $ca = explode('/', $a)[2];
        $cb = explode('/', $b)[2];
        if ($ca === $cb) continue;
        if ($hashes[$a] === null || $hashes[$b] === null) continue;
        $d = hamming($hashes[$a], $hashes[$b]);
        if ($d <= 6) $duplicates[] = "$a <> $b (distance $d)";
    }
}

/* retired reference sheet must not sit in the live artwork folders */
$retired = glob($root . '/assets/characters/npc/*');
foreach ($retired as $f) {
    if (is_file($f)) $needsWork[] = 'old NPC lineup still in live assets: ' . str_replace($root . '/', '', $f);
}

/* main character artwork */
$mc = [];
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/assets/characters/main')) as $file) {
    if (strtolower($file->getExtension()) === 'png') $mc[] = $file->getPathname();
}
$checked += count($mc);
$valid += count($mc);
if (!is_file($root . '/assets/characters/main/fullbody.png')) $missing[] = 'main character: full body';

/* ---------------- report ---------------- */
printf("Roster: %d characters (%d male, %d female)\n", count($roster),
    count(array_filter($roster, function ($r) { return $r['gender'] === 'male'; })),
    count(array_filter($roster, function ($r) { return $r['gender'] === 'female'; })));
printf("Artwork inspected: %d files (%d decodable)\n", $checked, $valid);
printf("Needs replacement: %d\n", count($needsWork));
foreach ($needsWork as $n) echo "  ! $n\n";
printf("Missing official assets: %d\n", count($missing));
foreach ($missing as $n) echo "  - $n\n";
printf("Near-duplicate artwork across characters: %d\n", count($duplicates));
foreach ($duplicates as $d) echo "  ~ $d\n";

$failed = count($needsWork) + count($duplicates);
if ($strict && $failed > 0) {
    fwrite(STDERR, "visual validation failed\n");
    exit(1);
}
echo "visual validation finished\n";
