import {BaseResource, NewResource, UpdatedResource} from 'types'

export interface ListPaginationParams {
  limit?: number
  offsetId?: string
}

export interface ResourceContext {
  requestingUserId: string
}

export interface CreateResourceParams<
  TResource extends BaseResource,
  TContext extends ResourceContext = ResourceContext,
> {
  new: NewResource<TResource>
  context: TContext
}

export interface ReadResourceParams<
  TContext extends ResourceContext = ResourceContext,
> {
  id: string
  context: TContext
}

export interface UpdateResourceParams<
  TResource extends BaseResource,
  TContext extends ResourceContext = ResourceContext,
> {
  updated: UpdatedResource<TResource>
  context: TContext
}

export interface DeleteResourceParams<
  TContext extends ResourceContext = ResourceContext,
> {
  id: string
  context: TContext
}

export interface ListResourceParams<
  TContext extends ResourceContext = ResourceContext,
> {
  list?: ListPaginationParams
  context: TContext
}

export interface Resource<
  TResource extends BaseResource,
  TContext extends ResourceContext = ResourceContext,
> {
  create(params: CreateResourceParams<TResource, TContext>): Promise<TResource>
  delete(params: DeleteResourceParams<TContext>): Promise<void>
  get(params: ReadResourceParams<TContext>): Promise<TResource>
  list(params: ListResourceParams<TContext>): Promise<TResource[]>
  update(params: UpdateResourceParams<TResource, TContext>): Promise<TResource>
}
