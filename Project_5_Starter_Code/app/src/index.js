import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;
    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      console.log("NetworkID: " + networkId);
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      console.log("Contract Address: " + deployedNetwork.address);
      console.log("Contract Abi: " + starNotaryArtifact.abi);
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      console.log(this.meta);

      // window.ethereum
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      console.log("Account: " + accounts[0]);
      for(var i=0; i<accounts.length ;i++) {
        console.log("User: " + i + " Address:" + accounts[i]);
      }

      this.account = accounts[0];
      this.setStatus("Started!");

    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function() {
    const { createStar } = this.meta.methods;

    const name = document.getElementById("starName").value;
    const symbol = document.getElementById("starSymbol").value;
    const id = document.getElementById("starId").value;
    await createStar(name, symbol, id).send({from: this.account});
    App.setStatus("New Star Owner is " + this.account + ".");
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function (){
    const { lookUptokenIdToStarInfo } = this.meta.methods;

    const starId = document.getElementById("lookid").value;
    if (starId) {
      let starName = await lookUptokenIdToStarInfo(starId).call();
      if (starName) {
        console.log("Star Found: " + starName);
      } else {
        console.log("Star NOT found!");
      }
    }
  }

};

window.App = App;

window.addEventListener("load", async function() {
  
  if (window.ethereum) {
    // use MetaMask's provider
    //await window.ethereum.enable(); // get permission to access accounts
    //App.web3 = new Web3(window.ethereum);
    
    console.log("Ethereum is used!");
    App.web3 = new Web3(window.ethereum);
    //App.web3 = new Web3("https://rinkeby.infura.io/v3/08bf6bafec054639967338a9de7fab62");
    console.log("IsMetamask: " + ethereum.isMetaMask);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);

    console.log("Ethereum Set!");
  }
    
  App.start();
  
});