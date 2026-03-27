const legacyMediaAssetUrlMap: Record<string, string> = {
  "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80":
    "/media/home-hero.jpg",
  "https://images.unsplash.com/photo-1715595621488-6450fb770d2d?auto=format&fit=crop&w=1200&q=80":
    "/media/vardzia.jpg",
  "https://images.unsplash.com/photo-1575731400875-6c2f1550b8db?auto=format&fit=crop&w=1200&q=80":
    "/media/gergeti.jpg",
  "https://images.unsplash.com/photo-1665302510594-2570d72a016f?auto=format&fit=crop&w=1200&q=80":
    "/media/ushguli.jpg",
  "https://images.unsplash.com/photo-1689845061422-2d5c819e9395?auto=format&fit=crop&w=1200&q=80":
    "/media/uplistsikhe.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/6/6b/Jvari_Monastery%2C_Mtskheta%2C_Georgia.jpg":
    "/media/jvari.jpg",
  "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=1200&q=80":
    "/media/vineyard.jpg",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80":
    "/media/polyphony.jpg",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80":
    "/media/supra.jpg",
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80":
    "/media/artisans.jpg",
};

export function normalizeMediaAssetUrl(url: string) {
  return legacyMediaAssetUrlMap[url] ?? url;
}
