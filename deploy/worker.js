// Static host for the single-file build: everything is served from env.ASSETS.
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
