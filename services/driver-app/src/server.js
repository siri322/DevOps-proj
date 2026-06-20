const { createApp } = require("./app");

const port = process.env.PORT || 3003;
createApp().listen(port, () => {
  console.log(`driver app listening on ${port}`);
});
