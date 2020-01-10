const express = require("express");
const app = express();
const port = 3000;

app.post("/status", (req, res) => res.sendStatus(200));

app.post("/widget/accountWidget", (req, res) =>
  res.send({
    rows: [
      {
        type: "iframe",
        html: "<b>Customer widget<b>"
      }
    ]
  })
);

app.post("/widget/orderWidget", (req, res) =>
  res.send({
    rows: [
      {
        type: "iframe",
        html: "<b>Order widget<b>"
      }
    ]
  })
);

app.listen(port, () =>
  console.log(`Example widget app listening on port ${port}!`)
);
