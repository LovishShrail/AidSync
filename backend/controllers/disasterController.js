import { Disaster, Donation } from '../database.js';

export const getDisasters = async (req, res) => {
  try {
    const disasters = await Disaster.find({});
    res.json(disasters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cached disasters' });
  }
};

export const getDisasterById = async (req, res) => {
  try {
    const disaster = await Disaster.findOne({ disasterId: Number(req.params.id) });
    if (!disaster) return res.status(404).json({ error: 'Disaster not found' });
    res.json(disaster);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cached disaster' });
  }
};

export const updateDisasterMedia = async (req, res) => {
  const { id } = req.params;
  const { videoUrl, modelUrl } = req.body;

  try {
    const updated = await Disaster.findOneAndUpdate(
      { disasterId: Number(id) },
      { videoUrl, modelUrl },
      { new: true, upsert: true }
    );
    res.json({ success: true, disaster: updated });
  } catch (error) {
    console.error('Failed to update disaster media:', error);
    res.status(500).json({ error: 'Failed to update disaster media' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const disasters = await Disaster.find({});
    
    const typeGroup = {};
    const severityCount = { Critical: 0, High: 0, Medium: 0, Low: 0 };

    disasters.forEach(d => {
      // Category aggregation
      const type = d.type || 'Other';
      typeGroup[type] = (typeGroup[type] || 0) + d.collectedAmount;

      // Severity aggregation
      const sev = d.severity;
      if (severityCount[sev] !== undefined) {
        severityCount[sev]++;
      }
    });

    const categoryData = Object.keys(typeGroup).map(key => ({
      name: key,
      value: typeGroup[key]
    }));

    const severityData = Object.keys(severityCount).map(key => ({
      name: key,
      value: severityCount[key]
    }));

    // Fetch last 10 donations for timeline
    const recentDonations = await Donation.find({})
      .sort({ timestamp: -1 })
      .limit(10);
    
    const donationTimeline = recentDonations.reverse().map(don => ({
      name: new Date(don.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: don.amount
    }));

    res.json({
      categoryData,
      severityData,
      donationTimeline
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    res.status(500).json({ error: 'Failed to aggregate analytics' });
  }
};
