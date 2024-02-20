const router = require('express').Router();

router.post('/', (req, res) => {
    const html = `
        <html>
        <head>
        <script type="text/javascript">
          window.addEventListener('message', function (e) {
            console.log('onMessage!', e.data)
            let show = false;
            const subscription = JSON.parse(e.data[1])
            console.log('subscription', typeof subscription, subscription.description)

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