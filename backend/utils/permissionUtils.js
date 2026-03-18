/**
 * Permission Utilities
 * Helpers for checking user permissions within projects
 */

/**
 * Check if a user has a specific permission level in a project
 * @param {object} project - Project document
 * @param {string} userId - User ID to check
 * @param {string} requiredRole - Role required (admin, editor, viewer)
 * @returns {boolean}
 */
export const checkProjectPermission = (project, userId, requiredRole = 'viewer') => {
    if (!project || !userId) return false;

    const uId = userId.toString();
    const getSafeId = (val) => (val?._id ? val._id.toString() : val?.toString());

    // Project owner has all permissions
    if (project.owner && getSafeId(project.owner) === uId) {
        return true;
    }

    // Find member in project
    const member = project.members.find(
        (m) => m.user && getSafeId(m.user) === uId && m.status === 'active'
    );

    if (!member) return false;

    // Define role hierarchy
    const hierarchy = {
        admin: 3,
        editor: 2,
        viewer: 1,
    };

    const userRoleLevel = hierarchy[member.role] || 0;
    const requiredRoleLevel = hierarchy[requiredRole] || 1;

    return userRoleLevel >= requiredRoleLevel;
};
