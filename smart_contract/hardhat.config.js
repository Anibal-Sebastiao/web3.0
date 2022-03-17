require("@nomiclabs/hardhat-waffle")

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/CgwfHneOlfpLyl7IfBZM6XRyir6BXwam',
      accounts: ['33083adf4a8471e45ba50cfdd633412775b2823addaf92a3c04e2a7db0e8b2a4']
    }
  }
}