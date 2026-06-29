import { Disaster, Donation } from '../database.js';

export const logDonation = async (req, res) => {
  const { disasterId, donor, amount, organization } = req.body;
  if (disasterId === undefined || !donor || amount === undefined || !organization) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const donation = await Donation.create({
      disasterId: Number(disasterId),
      donor,
      amount: Number(amount),
      organization,
      timestamp: new Date()
    });

    // Also update cached disaster's collectedAmount
    await Disaster.findOneAndUpdate(
      { disasterId: Number(disasterId) },
      { $inc: { collectedAmount: Number(amount) } }
    );

    res.json({ success: true, donation });
  } catch (error) {
    console.error('Failed to log donation:', error);
    res.status(500).json({ error: 'Failed to log donation' });
  }
};
