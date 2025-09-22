const prisma = require('../config/database');

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

exports.getDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId,
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const { name, specialty, phone, email, address } = req.body;

    const doctor = await prisma.doctor.create({
      data: {
        name,
        specialty,
        phone: phone || null,
        email: email || null,
        address: address || null,
        userId: req.userId,
      },
    });

    res.status(201).json({ success: true, doctor });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ error: 'Failed to create doctor' });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, phone, email, address } = req.body;

    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId,
      },
    });

    if (!existingDoctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctor = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data: {
        name,
        specialty,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });

    res.json({ success: true, doctor });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId,
      },
    });

    if (!existingDoctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    await prisma.doctor.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
};

exports.deleteAllDoctors = async (req, res) => {
  try {
    await prisma.doctor.deleteMany({
      where: { userId: req.userId },
    });

    res.json({ success: true, message: 'All doctors deleted successfully' });
  } catch (error) {
    console.error('Delete all doctors error:', error);
    res.status(500).json({ error: 'Failed to delete doctors' });
  }
};
