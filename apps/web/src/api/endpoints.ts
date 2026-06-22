export const endpoints = {
  // Auth
  auth: {
    register:           "/auth/register",
    verifyCode:         "/auth/verify-code",
    login:              "/auth/login",
    setPassword:        "/auth/set-password",
    forgotPassword:     "/auth/forgot-password",
    resendVerification: "/auth/resend-verification",
    me:                 "/auth/me",
    logout:             "/auth/logout",
    provision:          "/auth/provision",
    resetPassword:      "/auth/reset-password",
  },

  // Users
  users: {
    profile:      "/users/me",
    password:     "/users/me/password",
    avatarPresign: "/users/profile/avatar/presign",
    list:         "/users",
    byId:         (id: string) => `/users/${id}`,
    provision:    "/users/provision",
    status:       (id: string) => `/users/${id}/status`,
    role:         (id: string) => `/users/${id}/role`,
    resendInvite: "/users/resend-invite",
    delete:       (id: string) => `/users/${id}`,
  },

  // Super Admin
  superAdmin: {
    stats:     "/super-admin/stats",
    audit:     "/super-admin/audit",
    admins:    "/super-admin/admins",
    adminInvite: "/super-admin/admins/invite",
    adminRemove: (id: string) => `/super-admin/admins/${id}`,
    settings:  "/super-admin/settings",
  },

  // Admin
  admin: {
    dashboard:    "/admin/dashboard",
    users:        "/admin/users",
    userStatus:   (id: string) => `/admin/users/${id}/status`,
    userRole:     (id: string) => `/admin/users/${id}/role`,
    userInvite:    "/admin/users/invite",
    managers:      "/admin/managers",
    managerInvite: "/admin/managers/invite",
  },

  // Projects
  projects: {
    list:         "/projects",
    create:       "/projects",
    byId:         (id: string) => `/projects/${id}`,
    update:       (id: string) => `/projects/${id}`,
    status:       (id: string) => `/projects/${id}/status`,
    addMember:    (id: string) => `/projects/${id}/members`,
    removeMember: (id: string, userId: string) => `/projects/${id}/members/${userId}`,
    delete:       (id: string) => `/projects/${id}`,
  },

  // Intake
  intake: {
    submit:  "/intake",
    list:    "/intake",
    byId:    (id: string) => `/intake/${id}`,
    convert: (id: string) => `/intake/${id}/convert`,
  },

  //Milestones
  milestones: {
    list:    (projectId: string) => `/projects/${projectId}/milestones`,
    create:  (projectId: string) => `/projects/${projectId}/milestones`,
    byId:    (projectId: string, id: string) => `/projects/${projectId}/milestones/${id}`,
    update:  (projectId: string, id: string) => `/projects/${projectId}/milestones/${id}`,
    submit:  (projectId: string, id: string) => `/projects/${projectId}/milestones/${id}/submit`,
    approve: (projectId: string, id: string) => `/projects/${projectId}/milestones/${id}/approve`,
    reject:  (projectId: string, id: string) => `/projects/${projectId}/milestones/${id}/reject`,
    delete:  (projectId: string, id: string) => `/projects/${projectId}/milestones/${id}`,
  },

  //Tasks
  tasks: {
    list:   (projectId: string) => `/projects/${projectId}/tasks`,
    create: (projectId: string) => `/projects/${projectId}/tasks`,
    byId:   (projectId: string, id: string) => `/projects/${projectId}/tasks/${id}`,
    update: (projectId: string, id: string) => `/projects/${projectId}/tasks/${id}`,
    delete: (projectId: string, id: string) => `/projects/${projectId}/tasks/${id}`,
  },
  //Documents
  documents: {
    list:   (projectId: string) => `/projects/${projectId}/documents`,
    create: (projectId: string) => `/projects/${projectId}/documents`,
    byId:   (projectId: string, id: string) => `/projects/${projectId}/documents/${id}`,
    update: (projectId: string, id: string) => `/projects/${projectId}/documents/${id}`,
    delete: (projectId: string, id: string) => `/projects/${projectId}/documents/${id}`,
  },

  //Invoices
  invoices: {
    list:         (projectId: string) => `/projects/${projectId}/invoices`,
    create:       (projectId: string) => `/projects/${projectId}/invoices`,
    byId:         (projectId: string, id: string) => `/projects/${projectId}/invoices/${id}`,
    updateStatus: (projectId: string, id: string) => `/projects/${projectId}/invoices/${id}/status`,
  },

  //Comments
  comments: {
    list:   (projectId: string) => `/projects/${projectId}/comments`,
    create: (projectId: string) => `/projects/${projectId}/comments`,
    delete: (projectId: string, id: string) => `/projects/${projectId}/comments/${id}`,
  },

  //Change Requests
  changeRequests: {
    list:         (projectId: string) => `/projects/${projectId}/change-requests`,
    create:       (projectId: string) => `/projects/${projectId}/change-requests`,
    updateStatus: (projectId: string, id: string) => `/projects/${projectId}/change-requests/${id}/status`,
    delete:       (projectId: string, id: string) => `/projects/${projectId}/change-requests/${id}`,
  },

};
