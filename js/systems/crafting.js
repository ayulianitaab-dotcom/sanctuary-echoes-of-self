/* Sanctuary — cooking and crafting */
(function () {
  const C = (SAN.craft = {});

  C.canCook = function (recipe) {
    return SAN.state.hasAll(recipe.need);
  };
  C.cook = function (recipeId) {
    const S = SAN.state.S;
    const r = SAN.data.cookRecipes.find((x) => x.id === recipeId);
    if (!r) return false;
    if (!SAN.state.hasAll(r.need)) { SAN.ui.toast('You are missing ingredients.', 'warn'); return false; }
    if (!SAN.state.useEnergy(2)) { SAN.ui.toast('Too tired to cook. Sit down first.', 'warn'); return false; }
    SAN.state.spendItems(r.need);
    SAN.state.addItem(r.out, 1);
    S.stats.cooked++;
    SAN.quests.notify('cook', r.id, 1);
    SAN.progression.addXp('crafting', 8);
    SAN.audio.sfx('craft');
    SAN.ui.toast('Cooked ' + r.name + '.', 'item', SAN.render.itemIcon(r.out));
    return true;
  };

  C.canCraft = function (recipe) {
    const S = SAN.state.S;
    if (S.levels.crafting.lvl < (recipe.level || 0)) return false;
    return SAN.state.hasAll(recipe.need);
  };
  C.craft = function (recipeId) {
    const S = SAN.state.S;
    const r = SAN.data.craftRecipes.find((x) => x.id === recipeId);
    if (!r) return false;
    if (S.levels.crafting.lvl < (r.level || 0)) { SAN.ui.toast('You need Crafting level ' + r.level + '.', 'warn'); return false; }
    if (!SAN.state.hasAll(r.need)) { SAN.ui.toast('You are missing materials.', 'warn'); return false; }
    if (!SAN.state.useEnergy(2)) { SAN.ui.toast('Too tired to craft.', 'warn'); return false; }
    SAN.state.spendItems(r.need);
    SAN.state.addItem(r.out, 1);
    S.stats.crafted++;
    SAN.quests.notify('craft', r.id, 1);
    SAN.progression.addXp('crafting', 10);
    SAN.audio.sfx('craft');
    SAN.ui.toast('Crafted ' + r.name + '.', 'item', SAN.render.itemIcon(r.out));
    return true;
  };

  C.eat = function (itemId) {
    const S = SAN.state.S;
    const it = SAN.data.item(itemId);
    if (!it.energy) { SAN.ui.toast('That is not something you can eat.', 'info'); return false; }
    if (SAN.state.count(itemId) <= 0) return false;
    SAN.state.removeItem(itemId, 1);
    SAN.state.restoreEnergy(it.energy);
    SAN.ui.toast('You eat ' + it.name + '. +' + it.energy + ' energy.', 'item', SAN.render.itemIcon(itemId));
    SAN.audio.sfx('harvest');
    return true;
  };
})();
