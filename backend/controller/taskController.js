import Task from '../model/taskModel.js';
import Project from '../model/projectModel.js';
import Label from '../model/labelModel.js';
// ActivityLog, Notification models would be imported here once ported
import { checkProjectPermission } from '../utils/permissionUtils.js';

export const getTasks = async (req, res, next) => {
    try {
        const { project, status, priority, assignee, search, column } = req.query;
        const query = { isArchived: false };

        if (project) {
            const projectDoc = await Project.findOne({
                _id: project,
                $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
            });
            if (!projectDoc) return res.status(200).json({ success: true, count: 0, tasks: [] });
            query.project = project;
        } else {
            const userProjects = await Project.find({
                $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
            }).select('_id');
            query.project = { $in: userProjects.map(p => p._id) };
        }

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignee) query.assignees = assignee;
        if (column) query.column = column;
        if (search) query.$text = { $search: search };

        const tasks = await Task.find(query)
            .populate('assignees', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('labels')
            .sort({ order: 1, createdAt: -1 });

        res.status(200).json({ success: true, count: tasks.length, tasks });
    } catch (error) { next(error); }
};

export const getTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignees', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('labels')
            .populate('project', 'name workspace');
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
        res.status(200).json({ success: true, task });
    } catch (error) { next(error); }
};

export const createTask = async (req, res, next) => {
    try {
        const { title, description, project, column, assignees, priority, dueDate, labels, checklist, parentTask } = req.body;
        const projectDoc = await Project.findById(project);
        if (!projectDoc) return res.status(404).json({ success: false, message: 'Project not found' });

        if (!checkProjectPermission(projectDoc, req.user._id, 'editor')) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const lastTask = await Task.findOne({ project, column }).sort({ order: -1 }).select('order');
        const order = lastTask ? lastTask.order + 1 : 0;

        const task = await Task.create({
            title, description, project, column, order,
            assignees: assignees || [],
            reporter: req.user._id,
            priority: priority || 'medium',
            dueDate, labels: labels || [], checklist: checklist || [], parentTask
        });

        await task.populate('assignees', 'name email avatar');
        await task.populate('reporter', 'name email avatar');

        if (req.io) req.io.to(`project:${project}`).emit('task:created', task);

        res.status(201).json({ success: true, task });
    } catch (error) { next(error); }
};

export const updateTask = async (req, res, next) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const projectDoc = await Project.findById(task.project);
        if (!checkProjectPermission(projectDoc, req.user._id, 'editor')) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('assignees', 'name email avatar')
            .populate('labels');

        if (req.io) req.io.to(`project:${task.project}`).emit('task:updated', task);
        res.status(200).json({ success: true, task });
    } catch (error) { next(error); }
};

export const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const projectDoc = await Project.findById(task.project);
        const isAdmin = checkProjectPermission(projectDoc, req.user._id, 'admin');
        const isReporter = task.reporter.toString() === req.user._id.toString();

        if (!isAdmin && !isReporter) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await task.deleteOne();
        if (req.io) req.io.to(`project:${task.project}`).emit('task:deleted', { id: task._id });
        res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (error) { next(error); }
};

export const moveTask = async (req, res, next) => {
    try {
        const { column, order } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const projectDoc = await Project.findById(task.project);
        if (!checkProjectPermission(projectDoc, req.user._id, 'editor')) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        task.column = column;
        task.order = order;
        await task.save();

        await Task.updateMany(
            { project: task.project, column, _id: { $ne: task._id }, order: { $gte: order } },
            { $inc: { order: 1 } }
        );

        if (req.io) req.io.to(`project:${task.project}`).emit('task:moved', task);
        res.status(200).json({ success: true, task });
    } catch (error) { next(error); }
};
