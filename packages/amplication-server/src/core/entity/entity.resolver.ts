import {
  Args,
  Mutation,
  Query,
  Resolver,
  Parent,
  ResolveField
} from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';
import {
  CreateOneEntityArgs,
  FindManyEntityArgs,
  UpdateOneEntityArgs,
  FindOneEntityArgs,
  FindManyEntityVersionArgs,
  DeleteOneEntityArgs,
  UpdateEntityPermissionArgs,
  LockEntityArgs,
  FindManyEntityFieldArgs,
  AddEntityPermissionRoleArgs,
  DeleteEntityPermissionRoleArgs,
  AddEntityPermissionFieldArgs,
  DeleteEntityPermissionFieldArgs
} from './dto';
import {
  Entity,
  EntityField,
  EntityVersion,
  EntityPermission,
  EntityPermissionRole,
  EntityPermissionField,
  User
} from 'src/models';
import { GqlResolverExceptionsFilter } from 'src/filters/GqlResolverExceptions.filter';
import { EntityService } from './entity.service';
import { UserService } from '../user/user.service';
import { AuthorizeContext } from 'src/decorators/authorizeContext.decorator';
import { InjectContextValue } from 'src/decorators/injectContextValue.decorator';
import { AuthorizableResourceParameter } from 'src/enums/AuthorizableResourceParameter';
import { InjectableResourceParameter } from 'src/enums/InjectableResourceParameter';
import { GqlAuthGuard } from 'src/guards/gql-auth.guard';
import { UserEntity } from 'src/decorators/user.decorator';

@Resolver(() => Entity)
@UseFilters(GqlResolverExceptionsFilter)
@UseGuards(GqlAuthGuard)
export class EntityResolver {
  constructor(
    private readonly entityService: EntityService,
    private readonly userService: UserService
  ) {}

  @Query(() => Entity, {
    nullable: true,
    description: undefined
  })
  @AuthorizeContext(AuthorizableResourceParameter.EntityId, 'where.id')
  async entity(@Args() args: FindOneEntityArgs): Promise<Entity | null> {
    return this.entityService.entity(args);
  }

  @Query(() => [Entity], {
    nullable: false,
    description: undefined
  })
  @AuthorizeContext(AuthorizableResourceParameter.AppId, 'where.app.id')
  async entities(@Args() args: FindManyEntityArgs): Promise<Entity[]> {
    return this.entityService.entities(args);
  }

  @Mutation(() => Entity, {
    nullable: false,
    description: undefined
  })
  @AuthorizeContext(AuthorizableResourceParameter.AppId, 'data.app.connect.id')
  async createOneEntity(
    @UserEntity() user: User,
    @Args() args: CreateOneEntityArgs
  ): Promise<Entity> {
    return this.entityService.createOneEntity(args, user);
  }

  @Mutation(() => Entity, {
    nullable: true,
    description: undefined
  })
  @AuthorizeContext(AuthorizableResourceParameter.EntityId, 'where.id')
  async deleteEntity(
    @UserEntity() user: User,
    @Args() args: DeleteOneEntityArgs
  ): Promise<Entity | null> {
    return this.entityService.deleteOneEntity(args, user);
  }

  @Mutation(() => Entity, {
    nullable: true,
    description: undefined
  })
  @AuthorizeContext(AuthorizableResourceParameter.EntityId, 'where.id')
  async updateEntity(
    @UserEntity() user: User,
    @Args() args: UpdateOneEntityArgs
  ): Promise<Entity | null> {
    return this.entityService.updateOneEntity(args, user);
  }

  @Mutation(() => Entity, {
    nullable: true,
    description: undefined
  })
  @AuthorizeContext(AuthorizableResourceParameter.EntityId, 'where.id')
  @InjectContextValue(InjectableResourceParameter.UserId, 'userId')
  async lockEntity(
    @UserEntity() user: User,
    @Args() args: LockEntityArgs
  ): Promise<Entity | null> {
    return this.entityService.acquireLock(args, user);
  }

  @ResolveField(() => [EntityField])
  async fields(
    @Parent() entity: Entity,
    @Args() args: FindManyEntityFieldArgs
  ) {
    if (entity.fields && entity.fields.length) {
      return entity.fields;
    }
    //the fields property on the Entity always returns the fields of the current version (versionNumber=0)
    return this.entityService.getEntityFields(entity.id, 0, args);
  }

  @ResolveField(() => [EntityPermission])
  async permissions(@Parent() entity: Entity) {
    return this.entityService.getPermissions(entity.id);
  }

  @ResolveField(() => [EntityVersion])
  async entityVersions(
    @Parent() entity: Entity,
    @Args() args: FindManyEntityVersionArgs
  ) {
    return this.entityService.getVersions({
      ...args,
      where: { entity: { id: entity.id } }
    });
  }

  @ResolveField(() => [User])
  async lockedByUser(@Parent() entity: Entity) {
    return this.userService.user({
      where: {
        id: entity.lockedByUserId
      }
    });
  }

  /**@todo: add authorization header  */
  @Mutation(() => EntityPermission, {
    nullable: true,
    description: undefined
  })
  async updateEntityPermission(
    @UserEntity() user: User,
    @Args() args: UpdateEntityPermissionArgs
  ): Promise<EntityPermission> {
    return this.entityService.updateEntityPermission(args);
  }

  /**@todo: add authorization header  */
  @Mutation(() => EntityPermissionRole, {
    nullable: true,
    description: undefined
  })
  async addEntityPermissionRole(
    @Args() args: AddEntityPermissionRoleArgs
  ): Promise<EntityPermissionRole> {
    return this.entityService.addEntityPermissionRole(args);
  }

  /**@todo: add authorization header  */
  @Mutation(() => EntityPermissionRole, {
    nullable: true,
    description: undefined
  })
  async deleteEntityPermissionRole(
    @Args() args: DeleteEntityPermissionRoleArgs
  ): Promise<EntityPermissionRole> {
    return this.entityService.deleteEntityPermissionRole(args);
  }

  /**@todo: add authorization header  */
  @Mutation(() => EntityPermissionField, {
    nullable: true,
    description: undefined
  })
  async addEntityPermissionField(
    @Args() args: AddEntityPermissionFieldArgs
  ): Promise<EntityPermissionField> {
    return this.entityService.addEntityPermissionField(args);
  }

  /**@todo: add authorization header  */
  @Mutation(() => EntityPermissionField, {
    nullable: true,
    description: undefined
  })
  async deleteEntityPermissionField(
    @Args() args: DeleteEntityPermissionFieldArgs
  ): Promise<EntityPermissionField> {
    return this.entityService.deleteEntityPermissionField(args);
  }
}