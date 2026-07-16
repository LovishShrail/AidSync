import { ethers } from 'ethers';
import fs from 'fs';
import { Disaster, Donation } from '../database.js';

const DisasterDonateABI = JSON.parse(
  fs.readFileSync(new URL('../../frontend/src/contract/DisasterDonate.json', import.meta.url))
);

const providerUrl = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const contractAddress = process.env.CONTRACT_ADDRESS || '0xF0d2bdAB7F99400a62bE6d20D5F4A0963470dEbE';

export let provider;
export let contract;

export const initBlockchain = () => {
  try {
    provider = new ethers.JsonRpcProvider(providerUrl);
    contract = new ethers.Contract(contractAddress, DisasterDonateABI.abi, provider);
    console.log('Connected to Sepolia blockchain at:', contractAddress);

    // Sync existing data on boot
    syncDisastersFromBlockchain();

    // Setup live listeners
    listenToEvents();
  } catch (err) {
    console.error('Failed to initialize blockchain connection:', err.message);
  }
};

const syncDisastersFromBlockchain = async () => {
  if (!contract) return;
  console.log('Syncing disasters from blockchain...');
  try {
    const disastersData = await contract.getAllDisasterData();
    for (let i = 0; i < disastersData.length; i++) {
      const disaster = disastersData[i];
      const targetEth = Number(ethers.formatEther(disaster.targetCollectionAmount));
      const collectedEth = Number(ethers.formatEther(disaster.totalCollectedAmount));

      await Disaster.findOneAndUpdate(
        { disasterId: i },
        {
          disasterId: i,
          name: disaster.disasterName,
          type: disaster.disasterType,
          severity: disaster.severity,
          description: disaster.description,
          affectedAreas: disaster.affectedAreas,
          affectedPeopleCount: Number(disaster.affectedPeopleCount),
          targetAmount: targetEth,
          collectedAmount: collectedEth,
          reliefOrganizations: disaster.reliefOrganizations,
          topDonors: disaster.topDonors
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Synced ${disastersData.length} disasters successfully.`);
  } catch (error) {
    console.error('Error syncing blockchain data:', error);
  }
};

const listenToEvents = () => {
  if (!contract) return;
  
  try {
    if (contract.interface.hasEvent('Donated')) {
      // Listen to new donations to update collectedAmount and log history
      contract.on('Donated', async (disasterId, organization, donor, amount, event) => {
        try {
          console.log(`Event detected: Donation of ${ethers.formatEther(amount)} ETH to disaster #${disasterId}`);
          
          const amountEth = Number(ethers.formatEther(amount));
          const disId = Number(disasterId);

          // Create donation log
          await Donation.create({
            disasterId: disId,
            donor: donor,
            amount: amountEth,
            organization: organization,
            timestamp: new Date()
          });

          // Update cached disaster amount
          const disasterData = await contract.getDisaster(disId);
          await Disaster.findOneAndUpdate(
            { disasterId: disId },
            { 
              collectedAmount: Number(ethers.formatEther(disasterData.totalCollectedAmount)),
              topDonors: disasterData.topDonors
            }
          );
          console.log(`Updated cache for disaster #${disId}`);
        } catch (err) {
          console.error('Error handling Donated event:', err);
        }
      });
      console.log('Active event listeners registered.');
    } else {
      console.warn('Event "Donated" not found in contract ABI. Off-chain API calls will sync database cache.');
    }
  } catch (err) {
    console.error('Failed to check or register event listeners:', err);
  }
};

export const syncDisasterSingle = async (disasterId) => {
  if (!contract) return null;
  try {
    const disId = Number(disasterId);
    const disaster = await contract.getDisaster(disId);
    const targetEth = Number(ethers.formatEther(disaster.targetCollectionAmount));
    const collectedEth = Number(ethers.formatEther(disaster.totalCollectedAmount));

    const updated = await Disaster.findOneAndUpdate(
      { disasterId: disId },
      {
        name: disaster.disasterName,
        type: disaster.disasterType,
        severity: disaster.severity,
        description: disaster.description,
        affectedAreas: disaster.affectedAreas,
        affectedPeopleCount: Number(disaster.affectedPeopleCount),
        targetAmount: targetEth,
        collectedAmount: collectedEth,
        reliefOrganizations: disaster.reliefOrganizations,
        topDonors: {
          addresses: disaster.topDonors.addresses,
          amounts: disaster.topDonors.amounts.map(amt => Number(ethers.formatEther(amt)))
        }
      },
      { upsert: true, new: true }
    );
    console.log(`Self-healed/Synced single disaster #${disId} successfully.`);
    return updated;
  } catch (error) {
    console.error(`Error syncing single disaster #${disasterId}:`, error);
    return null;
  }
};
