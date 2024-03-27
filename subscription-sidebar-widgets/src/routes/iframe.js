const router = require('express').Router();

router.post('/', (req, res) => {
    const html = `
        <html>
        <head>
        <script type="text/javascript">
          window.addEventListener('message', function (e) {
            let show = false;
            const subscription = JSON.parse(e.data[1])

            if(!subscription.id) {

            } else {
              the_id = subscription.id;
            }

            document.querySelector('#description').innerHTML = subscription.description;

          });
          </script>

        </head>
        <body>
          Description: <div id="description"></div>


        </body>
    </html>
    `;
    res.send(html);
});

module.exports = router;