<?php
/**
 * Sanctuary — controlled cinematic illustration generator.
 *
 * This is a BUILD-TIME tool. The game never calls an image API: it only reads
 * assets that already exist, so it keeps working offline.
 *
 * Two things it can produce:
 *   1. location plates (default)  -> assets/scenes/backdrops/<key>.png
 *      environments only, no characters, safe for any scene.
 *   2. full scene illustrations   -> assets/scenes/<category>/<scene-id>.png
 *      only with a provider that accepts reference images, because the
 *      characters must match the official artwork exactly.
 *
 * Usage:
 *   php tools/scene-generate.php --dry-run          # print every prompt, generate nothing
 *   php tools/scene-generate.php --plates           # generate missing location plates
 *   php tools/scene-generate.php --scene romance/liora-first-date
 *
 * Configuration (environment, never committed):
 *   SCENE_PROVIDER   openai | gemini    (default: unset -> dry run)
 *   OPENAI_API_KEY   for provider=openai (images/edits accepts reference images)
 *   OPENAI_IMAGE_MODEL  default gpt-image-1
 *   GEMINI_API_KEY   for provider=gemini
 *   GEMINI_IMAGE_MODEL  default gemini-2.5-flash-image
 *
 * Reference images passed to the provider, in this order:
 *   1. assets/portraits/<npc>/fullbody.png   (identity)
 *   2. assets/portraits/<npc>/<mood>.png     (expression)
 *   3. assets/scenes/backdrops/<plate>.png   (location + style)
 * Generated files are cached: an existing file is never regenerated unless
 * --force is passed. Nothing here runs during gameplay.
 */

$root = dirname(__DIR__);
chdir($root);

$args = $argv;
$dry = in_array('--dry-run', $args, true);
$force = in_array('--force', $args, true);
$platesMode = in_array('--plates', $args, true);
$sceneArg = null;
foreach ($args as $i => $a) {
    if ($a === '--scene' && isset($args[$i + 1])) $sceneArg = $args[$i + 1];
}

/* ---------------- what exists ---------------- */
$backdrops = [
    'cottage-day' => 'A cozy Victorian cottage interior in daylight: oak panel walls, cream plaster, long plank floor, lavender sofa, stone fireplace, lace table runner, potted lavender, warm morning light through lace-curtained windows.',
    'cottage-night' => 'The same cozy Victorian cottage at night: fireplace glowing amber, candles, lavender quilt, deep blue dusk outside the lace-curtained windows, quiet and intimate.',
    'beach-sunset' => 'A quiet pebble shore at sunset in a fantasy coastal village, lighthouse silhouette far off, warm rose and gold sky, gentle surf, weathered wooden pier.',
    'greenhouse' => 'The interior of a Victorian glass greenhouse: iron arches, ferns and seedlings on wooden benches, watering cans, soft diffused daylight through misted panes.',
    'garden' => 'A cottage garden in full bloom: lavender and sage beds, stone path, low stone wall, climbing roses, soft morning haze.',
    'village-square' => 'A small fantasy village square with timber-framed cottages, a stone well, flower carts and bunting, golden afternoon light.',
    'library' => 'A Victorian village library interior: tall oak shelves, brass lamps, reading table with books, rolling ladder, dust motes in window light.',
    'lighthouse-night' => 'The lamp room of a lighthouse at night: brass lens glowing gold, iron spiral stairs, sea and stars beyond the glass, quiet.',
    'bakery' => 'A warm village bakery interior at dawn: wooden counter, fresh bread loaves, flour dust in the light, copper pots, tiled wall.',
];

$style = 'High-quality anime visual novel background illustration, romantic Victorian fantasy, '
    . 'soft pastel lighting, detailed environment, cinematic wide composition, '
    . 'lavender, cream, dusty pink, sage green and antique gold palette, painterly light, '
    . 'gentle depth of field, no text, no watermark, no characters, no people.';

/* full illustrations: id => [category, prompt, npc, mood] */
$scenes = [
    'romance/liora-first-date' => ['romance', 'Liora and the player character on the lighthouse beach at sunset, standing a careful step apart, warm wind, hopeful smiles, anime visual novel key art.', 'liora', 'gentle'],
    'romance/liora-confession' => ['romance', 'Liora and the player character close together in the lamp room at night, brass light on their faces, one honest confession, tender and quiet.', 'liora', 'surprised'],
    'romance/elowen-first-date' => ['romance', 'Elowen and the player character in the greenhouse after closing, holding seedlings, shy eye contact, soft green light.', 'elowen', 'gentle'],
    'romance/mira-cooking' => ['romance', 'Mira and the player character behind the bakery counter, flour on their sleeves, laughing over a shared loaf, warm dawn light.', 'mira', 'happy'],
];

/* ---------------- prompts ---------------- */
function plate_prompt($subject, $style)
{
    return $subject . ' ' . $style;
}

function scene_prompt($line, $style, $npc)
{
    return $line . ' Keep the characters identical to the supplied official reference art: '
        . 'same face shape, hair colour and style, eye colour, outfit, accessories and body proportions. '
        . 'Do not redesign anything. ' . $style;
}

/* ---------------- provider adapters ---------------- */
function provider()
{
    $p = getenv('SCENE_PROVIDER') ?: '';
    if ($p === 'openai' && getenv('OPENAI_API_KEY')) return 'openai';
    if ($p === 'gemini' && getenv('GEMINI_API_KEY')) return 'gemini';
    return null;
}

function save_image($bytes, $dest, $ext)
{
    if (!is_dir(dirname($dest)) && !mkdir(dirname($dest), 0777, true)) return false;
    if ($ext === 'png') return file_put_contents($dest, $bytes) !== false;
    $im = @imagecreatefromstring($bytes);
    if (!$im) return false;
    $ok = imagewebp($im, $dest, 86);
    imagedestroy($im);
    return $ok;
}

function openai_image($prompt, $refs, $model)
{
    $fields = ['model' => $model, 'prompt' => $prompt, 'size' => '1536x1024', 'n' => '1'];
    $files = [];
    foreach ($refs as $i => $ref) {
        if (!is_file($ref)) continue;
        $files['image[' . $i . ']'] = new CURLFile($ref, mime_content_type($ref), basename($ref));
    }
    $ch = curl_init('https://api.openai.com/v1/images/edits');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_TIMEOUT => 300,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . getenv('OPENAI_API_KEY')],
        CURLOPT_POSTFIELDS => array_merge($fields, $files),
    ]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($res === false || $code >= 300) {
        fwrite(STDERR, "openai error ($code): " . substr((string) $res, 0, 400) . "\n");
        return null;
    }
    $json = json_decode($res, true);
    $b64 = $json['data'][0]['b64_json'] ?? null;
    return $b64 ? base64_decode($b64) : null;
}

function gemini_image($prompt, $refs, $model)
{
    $parts = [['text' => $prompt]];
    foreach ($refs as $ref) {
        if (!is_file($ref)) continue;
        $parts[] = ['inline_data' => ['mime_type' => mime_content_type($ref), 'data' => base64_encode(file_get_contents($ref))]];
    }
    $body = json_encode(['contents' => [['parts' => $parts]]]);
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . $model . ':generateContent?key=' . getenv('GEMINI_API_KEY');
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_TIMEOUT => 300,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => $body,
    ]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($res === false || $code >= 300) {
        fwrite(STDERR, "gemini error ($code): " . substr((string) $res, 0, 400) . "\n");
        return null;
    }
    $json = json_decode($res, true);
    foreach (($json['candidates'][0]['content']['parts'] ?? []) as $part) {
        if (!empty($part['inlineData']['data'])) return base64_decode($part['inlineData']['data']);
    }
    return null;
}

/* ---------------- run ---------------- */
$prov = provider();
$made = 0;
$skipped = 0;

if ($dry || !$prov) {
    echo "Provider: " . ($prov ?: 'none configured (dry run)') . "\n\n";
}

foreach ($backdrops as $key => $subject) {
    $dest = 'assets/scenes/backdrops/' . $key . '.png';
    $prompt = plate_prompt($subject, $style);
    if (is_file($dest) && !$force) { $skipped++; continue; }
    if (is_file('assets/scenes/backdrops/' . $key . '.jpg') && !$force) { $skipped++; continue; }
    echo "[plate] $key\n  $prompt\n\n";
    if ($dry || !$prov) continue;
    $bytes = $prov === 'openai'
        ? openai_image($prompt, [], getenv('OPENAI_IMAGE_MODEL') ?: 'gpt-image-1')
        : gemini_image($prompt, [], getenv('GEMINI_IMAGE_MODEL') ?: 'gemini-2.5-flash-image');
    if ($bytes && save_image($bytes, $dest, 'png')) { $made++; echo "  -> $dest\n"; }
}

if ($sceneArg || in_array('--scenes', $args, true)) {
    foreach ($scenes as $id => $spec) {
        list($cat, $line, $npc, $mood) = $spec;
        if ($sceneArg && $sceneArg !== $id) continue;
        $dest = 'assets/scenes/' . $cat . '/' . str_replace('/', '-', $id) . '.png';
        if (is_file($dest) && !$force) { $skipped++; continue; }
        $refs = [
            'assets/portraits/' . $npc . '/fullbody.png',
            'assets/portraits/' . $npc . '/' . $mood . '.png',
            'assets/scenes/backdrops/cottage-day.jpg',
        ];
        $prompt = scene_prompt($line, $style, $npc);
        echo "[scene] $id\n  refs: " . implode(', ', $refs) . "\n  $prompt\n\n";
        if ($dry || !$prov) continue;
        $bytes = $prov === 'openai'
            ? openai_image($prompt, $refs, getenv('OPENAI_IMAGE_MODEL') ?: 'gpt-image-1')
            : gemini_image($prompt, $refs, getenv('GEMINI_IMAGE_MODEL') ?: 'gemini-2.5-flash-image');
        if ($bytes && save_image($bytes, $dest, 'png')) { $made++; echo "  -> $dest\n"; }
    }
}

printf("done: %d generated, %d cached\n", $made, $skipped);
