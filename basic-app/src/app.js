const express = require("express");
const app = express();
const port = 32020;

app.post("/status", (req, res) => res.sendStatus(200));

app.post("/widget/accountWidget", (req, res) =>
  res.send({
    rows: [
      {
        type: "text",
        text: "Click a button"
      },
      {
        type: "buttons",
        options: [
          {
            text: "Button 1",
            click: {
              type: "widgetRow",
              name: "accountClickedButton/1"
            }
          },
          {
            text: "Button 2",
            click: {
              type: "widgetRow",
              name: "accountClickedButton/2"
            }
          }
        ]
      }
    ]
  })
);

app.post("/widgetRow/accountClickedButton/:buttonId", (req, res) => {
  return res.send({
    type: "text",
    text: `You clicked Button ${req.params.buttonId}`
  });
});

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
