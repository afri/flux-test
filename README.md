
** Connecting to GCD

  - Create a new project in the Google Cloud Console (https://console.developers.google.com/)

  - Enable the Google Cloud Datastore API ('APIs' on left hand menu on the project page)

  - Add a Service account (menu > Credentials > Create new Client ID > Service Account)

  - Note down the Service account's email address (<long id>@developer.gserviceaccount.com)

  - Convert the downloaded *.p12 file to a pem file:

      openssl pkcs12 -in YOUR_P12_FILE.p12 -out key.pem -nodes

      (default gcd password for p12 file is 'notasecret') 

  - Think of a WITTY_PASSWORD

  - Import service account name into keychain:

      echo <long-id>@developer.gserviceaccount.com | flux-test/tools/add-key gcd.email WITTY_PASSWORD

  - Import key into keychain:

     flux-test/tools/add-key gcd.key WITTY_PASSWORD < key.pem

  - DELETE key.pem & the *.p12 file (or, if you want to keep them, reencrypt with different password)

