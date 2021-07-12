# This is an adjusted and customized version of https://github.com/Azure/communication-ui-library/tree/main/packages/react-composites

### How to run(Requires Server side from communication-ui-library/samples)
1. Clone the repo https://github.com/Azure/communication-ui-library
2. `rush install`
3. `rush build`
5. Replace the `ResourceConnectionString` in the `samples/Server/appsettings.json` file with the connection string from your Azure Communication Services resource, which is listed in the Azure Portal under *Keys*.
6. `cd samples/Server && rushx start`
7. Go back to this repo
8. `rush install`
9. `rush build`
10. `rushx start`
