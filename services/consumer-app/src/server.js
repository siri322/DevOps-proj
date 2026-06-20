const { createApp } = require("./app");

const port = process.env.PORT || 3002;
createApp().listen(port, () => {
  console.log(`consumer app listening on ${port}`);
});
