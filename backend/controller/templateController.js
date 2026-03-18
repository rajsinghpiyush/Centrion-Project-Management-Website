import Template from '../model/templateModel.js';

export const getTemplates = async (req, res, next) => {
    try {
        const { category, type, workspace } = req.query;
        const query = { $or: [{ isPublic: true }, { creator: req.user._id }] };
        if (workspace) query.$or.push({ workspace });
        if (category) query.category = category;
        if (type) query.type = type;

        const templates = await Template.find(query).populate('creator', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: templates.length, templates });
    } catch (error) { next(error); }
};

export const createTemplate = async (req, res, next) => {
    try {
        const template = await Template.create({ ...req.body, creator: req.user._id });
        res.status(201).json({ success: true, template });
    } catch (error) { next(error); }
};

export const getTemplate = async (req, res, next) => {
    try {
        const template = await Template.findById(req.params.id).populate('creator', 'name');
        if (!template) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, template });
    } catch (error) { next(error); }
};

export const deleteTemplate = async (req, res, next) => {
    try {
        const template = await Template.findById(req.params.id);
        if (!template || template.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized or not found' });
        }
        await template.deleteOne();
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) { next(error); }
};
