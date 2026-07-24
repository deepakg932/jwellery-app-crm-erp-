import multer from 'multer';
import path from 'path';
import fs from 'fs';
import JobCard from '../Models/models/JobCard.js';
import JobCardStage from '../Models/models/JobCardStage.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/job-cards';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
}).array('images', 10);

export const uploadJobCardImages = upload;

export const getJobCards = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { job_card_no: { $regex: search, $options: 'i' } },
        { quotation_number: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await JobCard.countDocuments(filter);
    const jobCards = await JobCard.find(filter)
      .populate('customer_id', 'name mobile phone customer_code')
      .populate('assigned_to', 'name employee_name')
      .populate('karigar_id', 'name')
      .populate('quotation_id', 'quotation_number')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, data: jobCards, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('getJobCards error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobCardById = async (req, res) => {
  try {
    const jobCard = await JobCard.findById(req.params.id)
      .populate('customer_id')
      .populate('assigned_to', 'name employee_name')
      .populate('karigar_id', 'name')
      .populate('quotation_id')
      .populate('items.product_id');

    if (!jobCard) return res.status(404).json({ success: false, message: 'Job card not found' });
    res.json({ success: true, data: jobCard });
  } catch (error) {
    console.error('getJobCardById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createJobCard = async (req, res) => {
  try {
    let data = req.body;

    if (typeof data.items === 'string') {
      try { data.items = JSON.parse(data.items); } catch (e) { data.items = []; }
    }

    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => `/uploads/job-cards/${f.filename}`);
    }

    if (!data.job_card_no) {
      const count = await JobCard.countDocuments();
      data.job_card_no = `JC-${String(count + 1).padStart(5, '0')}`;
    }

    if (data.total_amount && data.advance_amount) {
      data.balance_amount = parseFloat(data.total_amount) - parseFloat(data.advance_amount);
    }

    const jobCard = await JobCard.create(data);
    const populated = await jobCard.populate('customer_id', 'name mobile phone customer_code');

    res.status(201).json({ success: true, data: populated, message: 'Job card created successfully' });
  } catch (error) {
    console.error('createJobCard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateJobCard = async (req, res) => {
  try {
    let data = req.body;

    if (typeof data.items === 'string') {
      try { data.items = JSON.parse(data.items); } catch (e) { data.items = []; }
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => `/uploads/job-cards/${f.filename}`);
      const existing = data.existingImages ? JSON.parse(data.existingImages) : [];
      data.images = [...existing, ...newImages];
    }

    if (data.total_amount && data.advance_amount) {
      data.balance_amount = parseFloat(data.total_amount) - parseFloat(data.advance_amount);
    }

    const jobCard = await JobCard.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      .populate('customer_id', 'name mobile phone customer_code')
      .populate('assigned_to', 'name employee_name')
      .populate('karigar_id', 'name');

    if (!jobCard) return res.status(404).json({ success: false, message: 'Job card not found' });
    res.json({ success: true, data: jobCard, message: 'Job card updated successfully' });
  } catch (error) {
    console.error('updateJobCard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteJobCard = async (req, res) => {
  try {
    const jobCard = await JobCard.findByIdAndDelete(req.params.id);
    if (!jobCard) return res.status(404).json({ success: false, message: 'Job card not found' });

    await JobCardStage.deleteMany({ jobcard_id: req.params.id });

    res.json({ success: true, message: 'Job card deleted successfully' });
  } catch (error) {
    console.error('deleteJobCard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateJobCardStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const jobCard = await JobCard.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('customer_id', 'name mobile phone customer_code');

    if (!jobCard) return res.status(404).json({ success: false, message: 'Job card not found' });
    res.json({ success: true, data: jobCard, message: 'Status updated successfully' });
  } catch (error) {
    console.error('updateJobCardStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const convertToSale = async (req, res) => {
  try {
    const jobCard = await JobCard.findById(req.params.id)
      .populate('customer_id')
      .populate('items.product_id');

    if (!jobCard) return res.status(404).json({ success: false, message: 'Job card not found' });

    jobCard.status = 'completed';
    jobCard.converted_to_sale = true;
    await jobCard.save();

    res.json({ success: true, data: jobCard, message: 'Job card converted to sale successfully' });
  } catch (error) {
    console.error('convertToSale error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, status, notes, remarks, weight, quantity, assigned_to, assigned_karigar, start_date, end_date } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/job-cards/${f.filename}`);
    }

    const updateData = { stage, status, notes, remarks, weight, quantity, assigned_to, assigned_karigar, start_date, end_date };
    if (images.length > 0) updateData.$push = { images: { $each: images } };

    const stageDoc = await JobCardStage.findOneAndUpdate(
      { jobcard_id: id, stage },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    if (!stageDoc) return res.status(404).json({ success: false, message: 'Stage not found' });

    await JobCard.findByIdAndUpdate(id, { stage, status: status === 'done' || status === 'completed' ? 'in-progress' : undefined });

    res.json({ success: true, data: stageDoc, message: 'Stage updated successfully' });
  } catch (error) {
    console.error('updateStage error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStagesByType = async (req, res) => {
  try {
    const { stage } = req.query;
    const filter = {};
    if (stage) filter.stage = stage;

    const stages = await JobCardStage.find(filter)
      .populate({
        path: 'jobcard_id',
        populate: [
          { path: 'customer_id', select: 'name mobile phone' },
          { path: 'assigned_to', select: 'name employee_name' },
        ],
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: stages });
  } catch (error) {
    console.error('getStagesByType error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
