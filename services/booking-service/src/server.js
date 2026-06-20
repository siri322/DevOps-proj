const { createApp } = require("./app");

const port = process.env.PORT || 3004;
createApp().listen(port, () => {
  console.log(`booking service listening on ${port}`);
});
