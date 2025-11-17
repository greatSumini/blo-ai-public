import type { Hono } from 'hono';
import { getAuth } from '@hono/clerk-auth';
import { failure } from '@/backend/http/response';
import { respondWithDomain, respondCreated } from '@/backend/http/mapper';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import {
  CreateOrganizationRequestSchema,
  UpdateOrganizationRequestSchema,
  AddMemberRequestSchema,
} from './schema';
import {
  listOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  listMembers,
  addMember,
  removeMember,
  leaveOrganization,
} from './service';
import { organizationErrorCodes } from './error';

export const registerOrganizationsRoutes = (app: Hono<AppEnv>) => {
  /**
   * GET /api/organizations
   * Lists all organizations where the current user is a member
   */
  app.get('/api/organizations', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, organizationErrorCodes.unauthorized, 'Authentication required. Please sign in.'),
        401
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await listOrganizations(supabase, auth.userId);

    if (result.ok) {
      logger.info('Organizations listed successfully', {
        userId: auth.userId,
        count: result.data.organizations.length,
      });
    }

    return respondWithDomain(c, result);
  });

  /**
   * GET /api/organizations/:id
   * Gets a single organization by ID
   */
  app.get('/api/organizations/:id', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, organizationErrorCodes.unauthorized, 'Authentication required. Please sign in.'),
        401
      );
    }

    const organizationId = c.req.param('id');
    if (!organizationId) {
      return c.json(
        failure(400, organizationErrorCodes.validationError, 'Organization ID is required.'),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getOrganizationById(supabase, auth.userId, organizationId);

    if (result.ok) {
      logger.info('Organization retrieved successfully', {
        userId: auth.userId,
        organizationId,
      });
    }

    return respondWithDomain(c, result);
  });

  /**
   * POST /api/organizations
   * Creates a new organization
   */
  app.post('/api/organizations', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, organizationErrorCodes.unauthorized, 'Authentication required. Please sign in.'),
        401
      );
    }

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = CreateOrganizationRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          organizationErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format()
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await createOrganization(supabase, auth.userId, parsedBody.data);

    if (result.ok) {
      logger.info('Organization created successfully', {
        userId: auth.userId,
        organizationId: result.data.id,
      });
    }

    return respondCreated(c, result);
  });

  /**
   * PATCH /api/organizations/:id
   * Updates an organization
   */
  app.patch('/api/organizations/:id', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, organizationErrorCodes.unauthorized, 'Authentication required. Please sign in.'),
        401
      );
    }

    const organizationId = c.req.param('id');
    if (!organizationId) {
      return c.json(
        failure(400, organizationErrorCodes.validationError, 'Organization ID is required.'),
        400
      );
    }

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = UpdateOrganizationRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          organizationErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format()
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await updateOrganization(
      supabase,
      auth.userId,
      organizationId,
      parsedBody.data
    );

    if (result.ok) {
      logger.info('Organization updated successfully', {
        userId: auth.userId,
        organizationId,
      });
    }

    return respondWithDomain(c, result);
  });

  /**
   * DELETE /api/organizations/:id
   * Deletes an organization
   */
  app.delete('/api/organizations/:id', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, organizationErrorCodes.unauthorized, 'Authentication required. Please sign in.'),
        401
      );
    }

    const organizationId = c.req.param('id');
    if (!organizationId) {
      return c.json(
        failure(400, organizationErrorCodes.validationError, 'Organization ID is required.'),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await deleteOrganization(supabase, auth.userId, organizationId);

    if (result.ok) {
      logger.info('Organization deleted successfully', {
        userId: auth.userId,
        organizationId,
      });
    }

    return respondWithDomain(c, result);
  });

  /**
   * POST /api/organizations/:id/leave
   * Leave an organization (member only, not owner)
   */
  app.post('/api/organizations/:id/leave', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, organizationErrorCodes.unauthorized, 'Authentication required. Please sign in.'),
        401
      );
    }

    const organizationId = c.req.param('id');
    if (!organizationId) {
      return c.json(
        failure(400, organizationErrorCodes.validationError, 'Organization ID is required.'),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await leaveOrganization(supabase, auth.userId, organizationId);

    if (result.ok) {
      logger.info('User left organization successfully', {
        userId: auth.userId,
        organizationId,
      });
    }

    return respondWithDomain(c, result);
  });

  /**
   * GET /api/organizations/:id/members
   * Lists all members of an organization
   */
  app.get('/api/organizations/:id/members', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, organizationErrorCodes.unauthorized, 'Authentication required. Please sign in.'),
        401
      );
    }

    const organizationId = c.req.param('id');
    if (!organizationId) {
      return c.json(
        failure(400, organizationErrorCodes.validationError, 'Organization ID is required.'),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await listMembers(supabase, auth.userId, organizationId);

    if (result.ok) {
      logger.info('Members listed successfully', {
        userId: auth.userId,
        organizationId,
        count: result.data.members.length,
      });
    }

    return respondWithDomain(c, result);
  });

  /**
   * POST /api/organizations/:id/members
   * Adds a member to an organization by email (owner only)
   */
  app.post('/api/organizations/:id/members', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, organizationErrorCodes.unauthorized, 'Authentication required. Please sign in.'),
        401
      );
    }

    const organizationId = c.req.param('id');
    if (!organizationId) {
      return c.json(
        failure(400, organizationErrorCodes.validationError, 'Organization ID is required.'),
        400
      );
    }

    // Parse and validate request body
    const body = await c.req.json();
    const parsedBody = AddMemberRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          organizationErrorCodes.validationError,
          'Invalid request body. Please check your input.',
          parsedBody.error.format()
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await addMember(
      supabase,
      auth.userId,
      organizationId,
      parsedBody.data
    );

    if (result.ok) {
      logger.info('Member added successfully', {
        userId: auth.userId,
        organizationId,
        memberEmail: parsedBody.data.email,
      });
    }

    return respondCreated(c, result);
  });

  /**
   * DELETE /api/organizations/:id/members/:memberId
   * Removes a member from an organization (owner only)
   */
  app.delete('/api/organizations/:id/members/:memberId', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json(
        failure(401, organizationErrorCodes.unauthorized, 'Authentication required. Please sign in.'),
        401
      );
    }

    const organizationId = c.req.param('id');
    const memberId = c.req.param('memberId');

    if (!organizationId || !memberId) {
      return c.json(
        failure(400, organizationErrorCodes.validationError, 'Organization ID and Member ID are required.'),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await removeMember(supabase, auth.userId, organizationId, memberId);

    if (result.ok) {
      logger.info('Member removed successfully', {
        userId: auth.userId,
        organizationId,
        memberId,
      });
    }

    return respondWithDomain(c, result);
  });
};
