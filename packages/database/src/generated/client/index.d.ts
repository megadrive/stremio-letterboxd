
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Cinemeta
 * 
 */
export type Cinemeta = $Result.DefaultSelection<Prisma.$CinemetaPayload>
/**
 * Model Config
 * 
 */
export type Config = $Result.DefaultSelection<Prisma.$ConfigPayload>
/**
 * Model Film
 * 
 */
export type Film = $Result.DefaultSelection<Prisma.$FilmPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Cinemetas
 * const cinemetas = await prisma.cinemeta.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Cinemetas
   * const cinemetas = await prisma.cinemeta.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.cinemeta`: Exposes CRUD operations for the **Cinemeta** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Cinemetas
    * const cinemetas = await prisma.cinemeta.findMany()
    * ```
    */
  get cinemeta(): Prisma.CinemetaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.config`: Exposes CRUD operations for the **Config** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Configs
    * const configs = await prisma.config.findMany()
    * ```
    */
  get config(): Prisma.ConfigDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.film`: Exposes CRUD operations for the **Film** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Films
    * const films = await prisma.film.findMany()
    * ```
    */
  get film(): Prisma.FilmDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.5.0
   * Query Engine version: 173f8d54f8d52e692c7e27e72a88314ec7aeff60
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Cinemeta: 'Cinemeta',
    Config: 'Config',
    Film: 'Film'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "cinemeta" | "config" | "film"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Cinemeta: {
        payload: Prisma.$CinemetaPayload<ExtArgs>
        fields: Prisma.CinemetaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CinemetaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CinemetaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CinemetaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CinemetaPayload>
          }
          findFirst: {
            args: Prisma.CinemetaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CinemetaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CinemetaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CinemetaPayload>
          }
          findMany: {
            args: Prisma.CinemetaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CinemetaPayload>[]
          }
          create: {
            args: Prisma.CinemetaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CinemetaPayload>
          }
          createMany: {
            args: Prisma.CinemetaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CinemetaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CinemetaPayload>[]
          }
          delete: {
            args: Prisma.CinemetaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CinemetaPayload>
          }
          update: {
            args: Prisma.CinemetaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CinemetaPayload>
          }
          deleteMany: {
            args: Prisma.CinemetaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CinemetaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CinemetaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CinemetaPayload>[]
          }
          upsert: {
            args: Prisma.CinemetaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CinemetaPayload>
          }
          aggregate: {
            args: Prisma.CinemetaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCinemeta>
          }
          groupBy: {
            args: Prisma.CinemetaGroupByArgs<ExtArgs>
            result: $Utils.Optional<CinemetaGroupByOutputType>[]
          }
          count: {
            args: Prisma.CinemetaCountArgs<ExtArgs>
            result: $Utils.Optional<CinemetaCountAggregateOutputType> | number
          }
        }
      }
      Config: {
        payload: Prisma.$ConfigPayload<ExtArgs>
        fields: Prisma.ConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          findFirst: {
            args: Prisma.ConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          findMany: {
            args: Prisma.ConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>[]
          }
          create: {
            args: Prisma.ConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          createMany: {
            args: Prisma.ConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>[]
          }
          delete: {
            args: Prisma.ConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          update: {
            args: Prisma.ConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          deleteMany: {
            args: Prisma.ConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConfigUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>[]
          }
          upsert: {
            args: Prisma.ConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          aggregate: {
            args: Prisma.ConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConfig>
          }
          groupBy: {
            args: Prisma.ConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConfigCountArgs<ExtArgs>
            result: $Utils.Optional<ConfigCountAggregateOutputType> | number
          }
        }
      }
      Film: {
        payload: Prisma.$FilmPayload<ExtArgs>
        fields: Prisma.FilmFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FilmFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FilmFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmPayload>
          }
          findFirst: {
            args: Prisma.FilmFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FilmFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmPayload>
          }
          findMany: {
            args: Prisma.FilmFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmPayload>[]
          }
          create: {
            args: Prisma.FilmCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmPayload>
          }
          createMany: {
            args: Prisma.FilmCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FilmCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmPayload>[]
          }
          delete: {
            args: Prisma.FilmDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmPayload>
          }
          update: {
            args: Prisma.FilmUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmPayload>
          }
          deleteMany: {
            args: Prisma.FilmDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FilmUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FilmUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmPayload>[]
          }
          upsert: {
            args: Prisma.FilmUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmPayload>
          }
          aggregate: {
            args: Prisma.FilmAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFilm>
          }
          groupBy: {
            args: Prisma.FilmGroupByArgs<ExtArgs>
            result: $Utils.Optional<FilmGroupByOutputType>[]
          }
          count: {
            args: Prisma.FilmCountArgs<ExtArgs>
            result: $Utils.Optional<FilmCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    cinemeta?: CinemetaOmit
    config?: ConfigOmit
    film?: FilmOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model Cinemeta
   */

  export type AggregateCinemeta = {
    _count: CinemetaCountAggregateOutputType | null
    _min: CinemetaMinAggregateOutputType | null
    _max: CinemetaMaxAggregateOutputType | null
  }

  export type CinemetaMinAggregateOutputType = {
    id: string | null
    info: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CinemetaMaxAggregateOutputType = {
    id: string | null
    info: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CinemetaCountAggregateOutputType = {
    id: number
    info: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CinemetaMinAggregateInputType = {
    id?: true
    info?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CinemetaMaxAggregateInputType = {
    id?: true
    info?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CinemetaCountAggregateInputType = {
    id?: true
    info?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CinemetaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cinemeta to aggregate.
     */
    where?: CinemetaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cinemetas to fetch.
     */
    orderBy?: CinemetaOrderByWithRelationInput | CinemetaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CinemetaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cinemetas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cinemetas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Cinemetas
    **/
    _count?: true | CinemetaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CinemetaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CinemetaMaxAggregateInputType
  }

  export type GetCinemetaAggregateType<T extends CinemetaAggregateArgs> = {
        [P in keyof T & keyof AggregateCinemeta]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCinemeta[P]>
      : GetScalarType<T[P], AggregateCinemeta[P]>
  }




  export type CinemetaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CinemetaWhereInput
    orderBy?: CinemetaOrderByWithAggregationInput | CinemetaOrderByWithAggregationInput[]
    by: CinemetaScalarFieldEnum[] | CinemetaScalarFieldEnum
    having?: CinemetaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CinemetaCountAggregateInputType | true
    _min?: CinemetaMinAggregateInputType
    _max?: CinemetaMaxAggregateInputType
  }

  export type CinemetaGroupByOutputType = {
    id: string
    info: string
    createdAt: Date
    updatedAt: Date
    _count: CinemetaCountAggregateOutputType | null
    _min: CinemetaMinAggregateOutputType | null
    _max: CinemetaMaxAggregateOutputType | null
  }

  type GetCinemetaGroupByPayload<T extends CinemetaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CinemetaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CinemetaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CinemetaGroupByOutputType[P]>
            : GetScalarType<T[P], CinemetaGroupByOutputType[P]>
        }
      >
    >


  export type CinemetaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    info?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cinemeta"]>

  export type CinemetaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    info?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cinemeta"]>

  export type CinemetaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    info?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cinemeta"]>

  export type CinemetaSelectScalar = {
    id?: boolean
    info?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CinemetaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "info" | "createdAt" | "updatedAt", ExtArgs["result"]["cinemeta"]>

  export type $CinemetaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Cinemeta"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      info: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["cinemeta"]>
    composites: {}
  }

  type CinemetaGetPayload<S extends boolean | null | undefined | CinemetaDefaultArgs> = $Result.GetResult<Prisma.$CinemetaPayload, S>

  type CinemetaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CinemetaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CinemetaCountAggregateInputType | true
    }

  export interface CinemetaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Cinemeta'], meta: { name: 'Cinemeta' } }
    /**
     * Find zero or one Cinemeta that matches the filter.
     * @param {CinemetaFindUniqueArgs} args - Arguments to find a Cinemeta
     * @example
     * // Get one Cinemeta
     * const cinemeta = await prisma.cinemeta.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CinemetaFindUniqueArgs>(args: SelectSubset<T, CinemetaFindUniqueArgs<ExtArgs>>): Prisma__CinemetaClient<$Result.GetResult<Prisma.$CinemetaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Cinemeta that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CinemetaFindUniqueOrThrowArgs} args - Arguments to find a Cinemeta
     * @example
     * // Get one Cinemeta
     * const cinemeta = await prisma.cinemeta.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CinemetaFindUniqueOrThrowArgs>(args: SelectSubset<T, CinemetaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CinemetaClient<$Result.GetResult<Prisma.$CinemetaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cinemeta that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CinemetaFindFirstArgs} args - Arguments to find a Cinemeta
     * @example
     * // Get one Cinemeta
     * const cinemeta = await prisma.cinemeta.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CinemetaFindFirstArgs>(args?: SelectSubset<T, CinemetaFindFirstArgs<ExtArgs>>): Prisma__CinemetaClient<$Result.GetResult<Prisma.$CinemetaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cinemeta that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CinemetaFindFirstOrThrowArgs} args - Arguments to find a Cinemeta
     * @example
     * // Get one Cinemeta
     * const cinemeta = await prisma.cinemeta.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CinemetaFindFirstOrThrowArgs>(args?: SelectSubset<T, CinemetaFindFirstOrThrowArgs<ExtArgs>>): Prisma__CinemetaClient<$Result.GetResult<Prisma.$CinemetaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Cinemetas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CinemetaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cinemetas
     * const cinemetas = await prisma.cinemeta.findMany()
     * 
     * // Get first 10 Cinemetas
     * const cinemetas = await prisma.cinemeta.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cinemetaWithIdOnly = await prisma.cinemeta.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CinemetaFindManyArgs>(args?: SelectSubset<T, CinemetaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CinemetaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Cinemeta.
     * @param {CinemetaCreateArgs} args - Arguments to create a Cinemeta.
     * @example
     * // Create one Cinemeta
     * const Cinemeta = await prisma.cinemeta.create({
     *   data: {
     *     // ... data to create a Cinemeta
     *   }
     * })
     * 
     */
    create<T extends CinemetaCreateArgs>(args: SelectSubset<T, CinemetaCreateArgs<ExtArgs>>): Prisma__CinemetaClient<$Result.GetResult<Prisma.$CinemetaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Cinemetas.
     * @param {CinemetaCreateManyArgs} args - Arguments to create many Cinemetas.
     * @example
     * // Create many Cinemetas
     * const cinemeta = await prisma.cinemeta.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CinemetaCreateManyArgs>(args?: SelectSubset<T, CinemetaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Cinemetas and returns the data saved in the database.
     * @param {CinemetaCreateManyAndReturnArgs} args - Arguments to create many Cinemetas.
     * @example
     * // Create many Cinemetas
     * const cinemeta = await prisma.cinemeta.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Cinemetas and only return the `id`
     * const cinemetaWithIdOnly = await prisma.cinemeta.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CinemetaCreateManyAndReturnArgs>(args?: SelectSubset<T, CinemetaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CinemetaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Cinemeta.
     * @param {CinemetaDeleteArgs} args - Arguments to delete one Cinemeta.
     * @example
     * // Delete one Cinemeta
     * const Cinemeta = await prisma.cinemeta.delete({
     *   where: {
     *     // ... filter to delete one Cinemeta
     *   }
     * })
     * 
     */
    delete<T extends CinemetaDeleteArgs>(args: SelectSubset<T, CinemetaDeleteArgs<ExtArgs>>): Prisma__CinemetaClient<$Result.GetResult<Prisma.$CinemetaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Cinemeta.
     * @param {CinemetaUpdateArgs} args - Arguments to update one Cinemeta.
     * @example
     * // Update one Cinemeta
     * const cinemeta = await prisma.cinemeta.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CinemetaUpdateArgs>(args: SelectSubset<T, CinemetaUpdateArgs<ExtArgs>>): Prisma__CinemetaClient<$Result.GetResult<Prisma.$CinemetaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Cinemetas.
     * @param {CinemetaDeleteManyArgs} args - Arguments to filter Cinemetas to delete.
     * @example
     * // Delete a few Cinemetas
     * const { count } = await prisma.cinemeta.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CinemetaDeleteManyArgs>(args?: SelectSubset<T, CinemetaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cinemetas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CinemetaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cinemetas
     * const cinemeta = await prisma.cinemeta.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CinemetaUpdateManyArgs>(args: SelectSubset<T, CinemetaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cinemetas and returns the data updated in the database.
     * @param {CinemetaUpdateManyAndReturnArgs} args - Arguments to update many Cinemetas.
     * @example
     * // Update many Cinemetas
     * const cinemeta = await prisma.cinemeta.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Cinemetas and only return the `id`
     * const cinemetaWithIdOnly = await prisma.cinemeta.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CinemetaUpdateManyAndReturnArgs>(args: SelectSubset<T, CinemetaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CinemetaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Cinemeta.
     * @param {CinemetaUpsertArgs} args - Arguments to update or create a Cinemeta.
     * @example
     * // Update or create a Cinemeta
     * const cinemeta = await prisma.cinemeta.upsert({
     *   create: {
     *     // ... data to create a Cinemeta
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cinemeta we want to update
     *   }
     * })
     */
    upsert<T extends CinemetaUpsertArgs>(args: SelectSubset<T, CinemetaUpsertArgs<ExtArgs>>): Prisma__CinemetaClient<$Result.GetResult<Prisma.$CinemetaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Cinemetas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CinemetaCountArgs} args - Arguments to filter Cinemetas to count.
     * @example
     * // Count the number of Cinemetas
     * const count = await prisma.cinemeta.count({
     *   where: {
     *     // ... the filter for the Cinemetas we want to count
     *   }
     * })
    **/
    count<T extends CinemetaCountArgs>(
      args?: Subset<T, CinemetaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CinemetaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cinemeta.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CinemetaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CinemetaAggregateArgs>(args: Subset<T, CinemetaAggregateArgs>): Prisma.PrismaPromise<GetCinemetaAggregateType<T>>

    /**
     * Group by Cinemeta.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CinemetaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CinemetaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CinemetaGroupByArgs['orderBy'] }
        : { orderBy?: CinemetaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CinemetaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCinemetaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Cinemeta model
   */
  readonly fields: CinemetaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Cinemeta.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CinemetaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Cinemeta model
   */ 
  interface CinemetaFieldRefs {
    readonly id: FieldRef<"Cinemeta", 'String'>
    readonly info: FieldRef<"Cinemeta", 'String'>
    readonly createdAt: FieldRef<"Cinemeta", 'DateTime'>
    readonly updatedAt: FieldRef<"Cinemeta", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Cinemeta findUnique
   */
  export type CinemetaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cinemeta
     */
    select?: CinemetaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cinemeta
     */
    omit?: CinemetaOmit<ExtArgs> | null
    /**
     * Filter, which Cinemeta to fetch.
     */
    where: CinemetaWhereUniqueInput
  }

  /**
   * Cinemeta findUniqueOrThrow
   */
  export type CinemetaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cinemeta
     */
    select?: CinemetaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cinemeta
     */
    omit?: CinemetaOmit<ExtArgs> | null
    /**
     * Filter, which Cinemeta to fetch.
     */
    where: CinemetaWhereUniqueInput
  }

  /**
   * Cinemeta findFirst
   */
  export type CinemetaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cinemeta
     */
    select?: CinemetaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cinemeta
     */
    omit?: CinemetaOmit<ExtArgs> | null
    /**
     * Filter, which Cinemeta to fetch.
     */
    where?: CinemetaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cinemetas to fetch.
     */
    orderBy?: CinemetaOrderByWithRelationInput | CinemetaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cinemetas.
     */
    cursor?: CinemetaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cinemetas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cinemetas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cinemetas.
     */
    distinct?: CinemetaScalarFieldEnum | CinemetaScalarFieldEnum[]
  }

  /**
   * Cinemeta findFirstOrThrow
   */
  export type CinemetaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cinemeta
     */
    select?: CinemetaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cinemeta
     */
    omit?: CinemetaOmit<ExtArgs> | null
    /**
     * Filter, which Cinemeta to fetch.
     */
    where?: CinemetaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cinemetas to fetch.
     */
    orderBy?: CinemetaOrderByWithRelationInput | CinemetaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cinemetas.
     */
    cursor?: CinemetaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cinemetas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cinemetas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cinemetas.
     */
    distinct?: CinemetaScalarFieldEnum | CinemetaScalarFieldEnum[]
  }

  /**
   * Cinemeta findMany
   */
  export type CinemetaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cinemeta
     */
    select?: CinemetaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cinemeta
     */
    omit?: CinemetaOmit<ExtArgs> | null
    /**
     * Filter, which Cinemetas to fetch.
     */
    where?: CinemetaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cinemetas to fetch.
     */
    orderBy?: CinemetaOrderByWithRelationInput | CinemetaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Cinemetas.
     */
    cursor?: CinemetaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cinemetas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cinemetas.
     */
    skip?: number
    distinct?: CinemetaScalarFieldEnum | CinemetaScalarFieldEnum[]
  }

  /**
   * Cinemeta create
   */
  export type CinemetaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cinemeta
     */
    select?: CinemetaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cinemeta
     */
    omit?: CinemetaOmit<ExtArgs> | null
    /**
     * The data needed to create a Cinemeta.
     */
    data: XOR<CinemetaCreateInput, CinemetaUncheckedCreateInput>
  }

  /**
   * Cinemeta createMany
   */
  export type CinemetaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Cinemetas.
     */
    data: CinemetaCreateManyInput | CinemetaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cinemeta createManyAndReturn
   */
  export type CinemetaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cinemeta
     */
    select?: CinemetaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cinemeta
     */
    omit?: CinemetaOmit<ExtArgs> | null
    /**
     * The data used to create many Cinemetas.
     */
    data: CinemetaCreateManyInput | CinemetaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cinemeta update
   */
  export type CinemetaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cinemeta
     */
    select?: CinemetaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cinemeta
     */
    omit?: CinemetaOmit<ExtArgs> | null
    /**
     * The data needed to update a Cinemeta.
     */
    data: XOR<CinemetaUpdateInput, CinemetaUncheckedUpdateInput>
    /**
     * Choose, which Cinemeta to update.
     */
    where: CinemetaWhereUniqueInput
  }

  /**
   * Cinemeta updateMany
   */
  export type CinemetaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Cinemetas.
     */
    data: XOR<CinemetaUpdateManyMutationInput, CinemetaUncheckedUpdateManyInput>
    /**
     * Filter which Cinemetas to update
     */
    where?: CinemetaWhereInput
    /**
     * Limit how many Cinemetas to update.
     */
    limit?: number
  }

  /**
   * Cinemeta updateManyAndReturn
   */
  export type CinemetaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cinemeta
     */
    select?: CinemetaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cinemeta
     */
    omit?: CinemetaOmit<ExtArgs> | null
    /**
     * The data used to update Cinemetas.
     */
    data: XOR<CinemetaUpdateManyMutationInput, CinemetaUncheckedUpdateManyInput>
    /**
     * Filter which Cinemetas to update
     */
    where?: CinemetaWhereInput
    /**
     * Limit how many Cinemetas to update.
     */
    limit?: number
  }

  /**
   * Cinemeta upsert
   */
  export type CinemetaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cinemeta
     */
    select?: CinemetaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cinemeta
     */
    omit?: CinemetaOmit<ExtArgs> | null
    /**
     * The filter to search for the Cinemeta to update in case it exists.
     */
    where: CinemetaWhereUniqueInput
    /**
     * In case the Cinemeta found by the `where` argument doesn't exist, create a new Cinemeta with this data.
     */
    create: XOR<CinemetaCreateInput, CinemetaUncheckedCreateInput>
    /**
     * In case the Cinemeta was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CinemetaUpdateInput, CinemetaUncheckedUpdateInput>
  }

  /**
   * Cinemeta delete
   */
  export type CinemetaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cinemeta
     */
    select?: CinemetaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cinemeta
     */
    omit?: CinemetaOmit<ExtArgs> | null
    /**
     * Filter which Cinemeta to delete.
     */
    where: CinemetaWhereUniqueInput
  }

  /**
   * Cinemeta deleteMany
   */
  export type CinemetaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cinemetas to delete
     */
    where?: CinemetaWhereInput
    /**
     * Limit how many Cinemetas to delete.
     */
    limit?: number
  }

  /**
   * Cinemeta without action
   */
  export type CinemetaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cinemeta
     */
    select?: CinemetaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cinemeta
     */
    omit?: CinemetaOmit<ExtArgs> | null
  }


  /**
   * Model Config
   */

  export type AggregateConfig = {
    _count: ConfigCountAggregateOutputType | null
    _min: ConfigMinAggregateOutputType | null
    _max: ConfigMaxAggregateOutputType | null
  }

  export type ConfigMinAggregateOutputType = {
    id: string | null
    config: string | null
    metadata: string | null
    isReserved: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ConfigMaxAggregateOutputType = {
    id: string | null
    config: string | null
    metadata: string | null
    isReserved: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ConfigCountAggregateOutputType = {
    id: number
    config: number
    metadata: number
    isReserved: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ConfigMinAggregateInputType = {
    id?: true
    config?: true
    metadata?: true
    isReserved?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ConfigMaxAggregateInputType = {
    id?: true
    config?: true
    metadata?: true
    isReserved?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ConfigCountAggregateInputType = {
    id?: true
    config?: true
    metadata?: true
    isReserved?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Config to aggregate.
     */
    where?: ConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configs to fetch.
     */
    orderBy?: ConfigOrderByWithRelationInput | ConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Configs
    **/
    _count?: true | ConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConfigMaxAggregateInputType
  }

  export type GetConfigAggregateType<T extends ConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConfig[P]>
      : GetScalarType<T[P], AggregateConfig[P]>
  }




  export type ConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConfigWhereInput
    orderBy?: ConfigOrderByWithAggregationInput | ConfigOrderByWithAggregationInput[]
    by: ConfigScalarFieldEnum[] | ConfigScalarFieldEnum
    having?: ConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConfigCountAggregateInputType | true
    _min?: ConfigMinAggregateInputType
    _max?: ConfigMaxAggregateInputType
  }

  export type ConfigGroupByOutputType = {
    id: string
    config: string
    metadata: string
    isReserved: boolean
    createdAt: Date
    updatedAt: Date
    _count: ConfigCountAggregateOutputType | null
    _min: ConfigMinAggregateOutputType | null
    _max: ConfigMaxAggregateOutputType | null
  }

  type GetConfigGroupByPayload<T extends ConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConfigGroupByOutputType[P]>
            : GetScalarType<T[P], ConfigGroupByOutputType[P]>
        }
      >
    >


  export type ConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    config?: boolean
    metadata?: boolean
    isReserved?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["config"]>

  export type ConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    config?: boolean
    metadata?: boolean
    isReserved?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["config"]>

  export type ConfigSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    config?: boolean
    metadata?: boolean
    isReserved?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["config"]>

  export type ConfigSelectScalar = {
    id?: boolean
    config?: boolean
    metadata?: boolean
    isReserved?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ConfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "config" | "metadata" | "isReserved" | "createdAt" | "updatedAt", ExtArgs["result"]["config"]>

  export type $ConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Config"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      config: string
      metadata: string
      isReserved: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["config"]>
    composites: {}
  }

  type ConfigGetPayload<S extends boolean | null | undefined | ConfigDefaultArgs> = $Result.GetResult<Prisma.$ConfigPayload, S>

  type ConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConfigCountAggregateInputType | true
    }

  export interface ConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Config'], meta: { name: 'Config' } }
    /**
     * Find zero or one Config that matches the filter.
     * @param {ConfigFindUniqueArgs} args - Arguments to find a Config
     * @example
     * // Get one Config
     * const config = await prisma.config.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConfigFindUniqueArgs>(args: SelectSubset<T, ConfigFindUniqueArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Config that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConfigFindUniqueOrThrowArgs} args - Arguments to find a Config
     * @example
     * // Get one Config
     * const config = await prisma.config.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, ConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Config that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigFindFirstArgs} args - Arguments to find a Config
     * @example
     * // Get one Config
     * const config = await prisma.config.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConfigFindFirstArgs>(args?: SelectSubset<T, ConfigFindFirstArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Config that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigFindFirstOrThrowArgs} args - Arguments to find a Config
     * @example
     * // Get one Config
     * const config = await prisma.config.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, ConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Configs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Configs
     * const configs = await prisma.config.findMany()
     * 
     * // Get first 10 Configs
     * const configs = await prisma.config.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const configWithIdOnly = await prisma.config.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConfigFindManyArgs>(args?: SelectSubset<T, ConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Config.
     * @param {ConfigCreateArgs} args - Arguments to create a Config.
     * @example
     * // Create one Config
     * const Config = await prisma.config.create({
     *   data: {
     *     // ... data to create a Config
     *   }
     * })
     * 
     */
    create<T extends ConfigCreateArgs>(args: SelectSubset<T, ConfigCreateArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Configs.
     * @param {ConfigCreateManyArgs} args - Arguments to create many Configs.
     * @example
     * // Create many Configs
     * const config = await prisma.config.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConfigCreateManyArgs>(args?: SelectSubset<T, ConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Configs and returns the data saved in the database.
     * @param {ConfigCreateManyAndReturnArgs} args - Arguments to create many Configs.
     * @example
     * // Create many Configs
     * const config = await prisma.config.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Configs and only return the `id`
     * const configWithIdOnly = await prisma.config.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, ConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Config.
     * @param {ConfigDeleteArgs} args - Arguments to delete one Config.
     * @example
     * // Delete one Config
     * const Config = await prisma.config.delete({
     *   where: {
     *     // ... filter to delete one Config
     *   }
     * })
     * 
     */
    delete<T extends ConfigDeleteArgs>(args: SelectSubset<T, ConfigDeleteArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Config.
     * @param {ConfigUpdateArgs} args - Arguments to update one Config.
     * @example
     * // Update one Config
     * const config = await prisma.config.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConfigUpdateArgs>(args: SelectSubset<T, ConfigUpdateArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Configs.
     * @param {ConfigDeleteManyArgs} args - Arguments to filter Configs to delete.
     * @example
     * // Delete a few Configs
     * const { count } = await prisma.config.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConfigDeleteManyArgs>(args?: SelectSubset<T, ConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Configs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Configs
     * const config = await prisma.config.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConfigUpdateManyArgs>(args: SelectSubset<T, ConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Configs and returns the data updated in the database.
     * @param {ConfigUpdateManyAndReturnArgs} args - Arguments to update many Configs.
     * @example
     * // Update many Configs
     * const config = await prisma.config.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Configs and only return the `id`
     * const configWithIdOnly = await prisma.config.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ConfigUpdateManyAndReturnArgs>(args: SelectSubset<T, ConfigUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Config.
     * @param {ConfigUpsertArgs} args - Arguments to update or create a Config.
     * @example
     * // Update or create a Config
     * const config = await prisma.config.upsert({
     *   create: {
     *     // ... data to create a Config
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Config we want to update
     *   }
     * })
     */
    upsert<T extends ConfigUpsertArgs>(args: SelectSubset<T, ConfigUpsertArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Configs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigCountArgs} args - Arguments to filter Configs to count.
     * @example
     * // Count the number of Configs
     * const count = await prisma.config.count({
     *   where: {
     *     // ... the filter for the Configs we want to count
     *   }
     * })
    **/
    count<T extends ConfigCountArgs>(
      args?: Subset<T, ConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Config.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ConfigAggregateArgs>(args: Subset<T, ConfigAggregateArgs>): Prisma.PrismaPromise<GetConfigAggregateType<T>>

    /**
     * Group by Config.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConfigGroupByArgs['orderBy'] }
        : { orderBy?: ConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Config model
   */
  readonly fields: ConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Config.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Config model
   */ 
  interface ConfigFieldRefs {
    readonly id: FieldRef<"Config", 'String'>
    readonly config: FieldRef<"Config", 'String'>
    readonly metadata: FieldRef<"Config", 'String'>
    readonly isReserved: FieldRef<"Config", 'Boolean'>
    readonly createdAt: FieldRef<"Config", 'DateTime'>
    readonly updatedAt: FieldRef<"Config", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Config findUnique
   */
  export type ConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * Filter, which Config to fetch.
     */
    where: ConfigWhereUniqueInput
  }

  /**
   * Config findUniqueOrThrow
   */
  export type ConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * Filter, which Config to fetch.
     */
    where: ConfigWhereUniqueInput
  }

  /**
   * Config findFirst
   */
  export type ConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * Filter, which Config to fetch.
     */
    where?: ConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configs to fetch.
     */
    orderBy?: ConfigOrderByWithRelationInput | ConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Configs.
     */
    cursor?: ConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Configs.
     */
    distinct?: ConfigScalarFieldEnum | ConfigScalarFieldEnum[]
  }

  /**
   * Config findFirstOrThrow
   */
  export type ConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * Filter, which Config to fetch.
     */
    where?: ConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configs to fetch.
     */
    orderBy?: ConfigOrderByWithRelationInput | ConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Configs.
     */
    cursor?: ConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Configs.
     */
    distinct?: ConfigScalarFieldEnum | ConfigScalarFieldEnum[]
  }

  /**
   * Config findMany
   */
  export type ConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * Filter, which Configs to fetch.
     */
    where?: ConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configs to fetch.
     */
    orderBy?: ConfigOrderByWithRelationInput | ConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Configs.
     */
    cursor?: ConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configs.
     */
    skip?: number
    distinct?: ConfigScalarFieldEnum | ConfigScalarFieldEnum[]
  }

  /**
   * Config create
   */
  export type ConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * The data needed to create a Config.
     */
    data: XOR<ConfigCreateInput, ConfigUncheckedCreateInput>
  }

  /**
   * Config createMany
   */
  export type ConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Configs.
     */
    data: ConfigCreateManyInput | ConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Config createManyAndReturn
   */
  export type ConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * The data used to create many Configs.
     */
    data: ConfigCreateManyInput | ConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Config update
   */
  export type ConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * The data needed to update a Config.
     */
    data: XOR<ConfigUpdateInput, ConfigUncheckedUpdateInput>
    /**
     * Choose, which Config to update.
     */
    where: ConfigWhereUniqueInput
  }

  /**
   * Config updateMany
   */
  export type ConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Configs.
     */
    data: XOR<ConfigUpdateManyMutationInput, ConfigUncheckedUpdateManyInput>
    /**
     * Filter which Configs to update
     */
    where?: ConfigWhereInput
    /**
     * Limit how many Configs to update.
     */
    limit?: number
  }

  /**
   * Config updateManyAndReturn
   */
  export type ConfigUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * The data used to update Configs.
     */
    data: XOR<ConfigUpdateManyMutationInput, ConfigUncheckedUpdateManyInput>
    /**
     * Filter which Configs to update
     */
    where?: ConfigWhereInput
    /**
     * Limit how many Configs to update.
     */
    limit?: number
  }

  /**
   * Config upsert
   */
  export type ConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * The filter to search for the Config to update in case it exists.
     */
    where: ConfigWhereUniqueInput
    /**
     * In case the Config found by the `where` argument doesn't exist, create a new Config with this data.
     */
    create: XOR<ConfigCreateInput, ConfigUncheckedCreateInput>
    /**
     * In case the Config was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConfigUpdateInput, ConfigUncheckedUpdateInput>
  }

  /**
   * Config delete
   */
  export type ConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * Filter which Config to delete.
     */
    where: ConfigWhereUniqueInput
  }

  /**
   * Config deleteMany
   */
  export type ConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Configs to delete
     */
    where?: ConfigWhereInput
    /**
     * Limit how many Configs to delete.
     */
    limit?: number
  }

  /**
   * Config without action
   */
  export type ConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
  }


  /**
   * Model Film
   */

  export type AggregateFilm = {
    _count: FilmCountAggregateOutputType | null
    _avg: FilmAvgAggregateOutputType | null
    _sum: FilmSumAggregateOutputType | null
    _min: FilmMinAggregateOutputType | null
    _max: FilmMaxAggregateOutputType | null
  }

  export type FilmAvgAggregateOutputType = {
    year: number | null
    runtime: number | null
  }

  export type FilmSumAggregateOutputType = {
    year: number | null
    runtime: number | null
  }

  export type FilmMinAggregateOutputType = {
    id: string | null
    title: string | null
    year: number | null
    runtime: number | null
    description: string | null
    genres: string | null
    director: string | null
    cast: string | null
    imdb: string | null
    tmdb: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FilmMaxAggregateOutputType = {
    id: string | null
    title: string | null
    year: number | null
    runtime: number | null
    description: string | null
    genres: string | null
    director: string | null
    cast: string | null
    imdb: string | null
    tmdb: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FilmCountAggregateOutputType = {
    id: number
    title: number
    year: number
    runtime: number
    description: number
    genres: number
    director: number
    cast: number
    imdb: number
    tmdb: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FilmAvgAggregateInputType = {
    year?: true
    runtime?: true
  }

  export type FilmSumAggregateInputType = {
    year?: true
    runtime?: true
  }

  export type FilmMinAggregateInputType = {
    id?: true
    title?: true
    year?: true
    runtime?: true
    description?: true
    genres?: true
    director?: true
    cast?: true
    imdb?: true
    tmdb?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FilmMaxAggregateInputType = {
    id?: true
    title?: true
    year?: true
    runtime?: true
    description?: true
    genres?: true
    director?: true
    cast?: true
    imdb?: true
    tmdb?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FilmCountAggregateInputType = {
    id?: true
    title?: true
    year?: true
    runtime?: true
    description?: true
    genres?: true
    director?: true
    cast?: true
    imdb?: true
    tmdb?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FilmAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Film to aggregate.
     */
    where?: FilmWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Films to fetch.
     */
    orderBy?: FilmOrderByWithRelationInput | FilmOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FilmWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Films from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Films.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Films
    **/
    _count?: true | FilmCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FilmAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FilmSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FilmMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FilmMaxAggregateInputType
  }

  export type GetFilmAggregateType<T extends FilmAggregateArgs> = {
        [P in keyof T & keyof AggregateFilm]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFilm[P]>
      : GetScalarType<T[P], AggregateFilm[P]>
  }




  export type FilmGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FilmWhereInput
    orderBy?: FilmOrderByWithAggregationInput | FilmOrderByWithAggregationInput[]
    by: FilmScalarFieldEnum[] | FilmScalarFieldEnum
    having?: FilmScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FilmCountAggregateInputType | true
    _avg?: FilmAvgAggregateInputType
    _sum?: FilmSumAggregateInputType
    _min?: FilmMinAggregateInputType
    _max?: FilmMaxAggregateInputType
  }

  export type FilmGroupByOutputType = {
    id: string
    title: string
    year: number
    runtime: number
    description: string
    genres: string
    director: string
    cast: string
    imdb: string | null
    tmdb: string
    createdAt: Date
    updatedAt: Date
    _count: FilmCountAggregateOutputType | null
    _avg: FilmAvgAggregateOutputType | null
    _sum: FilmSumAggregateOutputType | null
    _min: FilmMinAggregateOutputType | null
    _max: FilmMaxAggregateOutputType | null
  }

  type GetFilmGroupByPayload<T extends FilmGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FilmGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FilmGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FilmGroupByOutputType[P]>
            : GetScalarType<T[P], FilmGroupByOutputType[P]>
        }
      >
    >


  export type FilmSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    year?: boolean
    runtime?: boolean
    description?: boolean
    genres?: boolean
    director?: boolean
    cast?: boolean
    imdb?: boolean
    tmdb?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["film"]>

  export type FilmSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    year?: boolean
    runtime?: boolean
    description?: boolean
    genres?: boolean
    director?: boolean
    cast?: boolean
    imdb?: boolean
    tmdb?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["film"]>

  export type FilmSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    year?: boolean
    runtime?: boolean
    description?: boolean
    genres?: boolean
    director?: boolean
    cast?: boolean
    imdb?: boolean
    tmdb?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["film"]>

  export type FilmSelectScalar = {
    id?: boolean
    title?: boolean
    year?: boolean
    runtime?: boolean
    description?: boolean
    genres?: boolean
    director?: boolean
    cast?: boolean
    imdb?: boolean
    tmdb?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FilmOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "year" | "runtime" | "description" | "genres" | "director" | "cast" | "imdb" | "tmdb" | "createdAt" | "updatedAt", ExtArgs["result"]["film"]>

  export type $FilmPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Film"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      year: number
      runtime: number
      description: string
      genres: string
      director: string
      cast: string
      imdb: string | null
      tmdb: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["film"]>
    composites: {}
  }

  type FilmGetPayload<S extends boolean | null | undefined | FilmDefaultArgs> = $Result.GetResult<Prisma.$FilmPayload, S>

  type FilmCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FilmFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FilmCountAggregateInputType | true
    }

  export interface FilmDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Film'], meta: { name: 'Film' } }
    /**
     * Find zero or one Film that matches the filter.
     * @param {FilmFindUniqueArgs} args - Arguments to find a Film
     * @example
     * // Get one Film
     * const film = await prisma.film.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FilmFindUniqueArgs>(args: SelectSubset<T, FilmFindUniqueArgs<ExtArgs>>): Prisma__FilmClient<$Result.GetResult<Prisma.$FilmPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Film that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FilmFindUniqueOrThrowArgs} args - Arguments to find a Film
     * @example
     * // Get one Film
     * const film = await prisma.film.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FilmFindUniqueOrThrowArgs>(args: SelectSubset<T, FilmFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FilmClient<$Result.GetResult<Prisma.$FilmPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Film that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmFindFirstArgs} args - Arguments to find a Film
     * @example
     * // Get one Film
     * const film = await prisma.film.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FilmFindFirstArgs>(args?: SelectSubset<T, FilmFindFirstArgs<ExtArgs>>): Prisma__FilmClient<$Result.GetResult<Prisma.$FilmPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Film that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmFindFirstOrThrowArgs} args - Arguments to find a Film
     * @example
     * // Get one Film
     * const film = await prisma.film.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FilmFindFirstOrThrowArgs>(args?: SelectSubset<T, FilmFindFirstOrThrowArgs<ExtArgs>>): Prisma__FilmClient<$Result.GetResult<Prisma.$FilmPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Films that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Films
     * const films = await prisma.film.findMany()
     * 
     * // Get first 10 Films
     * const films = await prisma.film.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const filmWithIdOnly = await prisma.film.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FilmFindManyArgs>(args?: SelectSubset<T, FilmFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilmPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Film.
     * @param {FilmCreateArgs} args - Arguments to create a Film.
     * @example
     * // Create one Film
     * const Film = await prisma.film.create({
     *   data: {
     *     // ... data to create a Film
     *   }
     * })
     * 
     */
    create<T extends FilmCreateArgs>(args: SelectSubset<T, FilmCreateArgs<ExtArgs>>): Prisma__FilmClient<$Result.GetResult<Prisma.$FilmPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Films.
     * @param {FilmCreateManyArgs} args - Arguments to create many Films.
     * @example
     * // Create many Films
     * const film = await prisma.film.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FilmCreateManyArgs>(args?: SelectSubset<T, FilmCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Films and returns the data saved in the database.
     * @param {FilmCreateManyAndReturnArgs} args - Arguments to create many Films.
     * @example
     * // Create many Films
     * const film = await prisma.film.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Films and only return the `id`
     * const filmWithIdOnly = await prisma.film.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FilmCreateManyAndReturnArgs>(args?: SelectSubset<T, FilmCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilmPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Film.
     * @param {FilmDeleteArgs} args - Arguments to delete one Film.
     * @example
     * // Delete one Film
     * const Film = await prisma.film.delete({
     *   where: {
     *     // ... filter to delete one Film
     *   }
     * })
     * 
     */
    delete<T extends FilmDeleteArgs>(args: SelectSubset<T, FilmDeleteArgs<ExtArgs>>): Prisma__FilmClient<$Result.GetResult<Prisma.$FilmPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Film.
     * @param {FilmUpdateArgs} args - Arguments to update one Film.
     * @example
     * // Update one Film
     * const film = await prisma.film.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FilmUpdateArgs>(args: SelectSubset<T, FilmUpdateArgs<ExtArgs>>): Prisma__FilmClient<$Result.GetResult<Prisma.$FilmPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Films.
     * @param {FilmDeleteManyArgs} args - Arguments to filter Films to delete.
     * @example
     * // Delete a few Films
     * const { count } = await prisma.film.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FilmDeleteManyArgs>(args?: SelectSubset<T, FilmDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Films.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Films
     * const film = await prisma.film.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FilmUpdateManyArgs>(args: SelectSubset<T, FilmUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Films and returns the data updated in the database.
     * @param {FilmUpdateManyAndReturnArgs} args - Arguments to update many Films.
     * @example
     * // Update many Films
     * const film = await prisma.film.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Films and only return the `id`
     * const filmWithIdOnly = await prisma.film.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FilmUpdateManyAndReturnArgs>(args: SelectSubset<T, FilmUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilmPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Film.
     * @param {FilmUpsertArgs} args - Arguments to update or create a Film.
     * @example
     * // Update or create a Film
     * const film = await prisma.film.upsert({
     *   create: {
     *     // ... data to create a Film
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Film we want to update
     *   }
     * })
     */
    upsert<T extends FilmUpsertArgs>(args: SelectSubset<T, FilmUpsertArgs<ExtArgs>>): Prisma__FilmClient<$Result.GetResult<Prisma.$FilmPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Films.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmCountArgs} args - Arguments to filter Films to count.
     * @example
     * // Count the number of Films
     * const count = await prisma.film.count({
     *   where: {
     *     // ... the filter for the Films we want to count
     *   }
     * })
    **/
    count<T extends FilmCountArgs>(
      args?: Subset<T, FilmCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FilmCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Film.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FilmAggregateArgs>(args: Subset<T, FilmAggregateArgs>): Prisma.PrismaPromise<GetFilmAggregateType<T>>

    /**
     * Group by Film.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FilmGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FilmGroupByArgs['orderBy'] }
        : { orderBy?: FilmGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FilmGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFilmGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Film model
   */
  readonly fields: FilmFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Film.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FilmClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Film model
   */ 
  interface FilmFieldRefs {
    readonly id: FieldRef<"Film", 'String'>
    readonly title: FieldRef<"Film", 'String'>
    readonly year: FieldRef<"Film", 'Int'>
    readonly runtime: FieldRef<"Film", 'Int'>
    readonly description: FieldRef<"Film", 'String'>
    readonly genres: FieldRef<"Film", 'String'>
    readonly director: FieldRef<"Film", 'String'>
    readonly cast: FieldRef<"Film", 'String'>
    readonly imdb: FieldRef<"Film", 'String'>
    readonly tmdb: FieldRef<"Film", 'String'>
    readonly createdAt: FieldRef<"Film", 'DateTime'>
    readonly updatedAt: FieldRef<"Film", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Film findUnique
   */
  export type FilmFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Film
     */
    select?: FilmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Film
     */
    omit?: FilmOmit<ExtArgs> | null
    /**
     * Filter, which Film to fetch.
     */
    where: FilmWhereUniqueInput
  }

  /**
   * Film findUniqueOrThrow
   */
  export type FilmFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Film
     */
    select?: FilmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Film
     */
    omit?: FilmOmit<ExtArgs> | null
    /**
     * Filter, which Film to fetch.
     */
    where: FilmWhereUniqueInput
  }

  /**
   * Film findFirst
   */
  export type FilmFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Film
     */
    select?: FilmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Film
     */
    omit?: FilmOmit<ExtArgs> | null
    /**
     * Filter, which Film to fetch.
     */
    where?: FilmWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Films to fetch.
     */
    orderBy?: FilmOrderByWithRelationInput | FilmOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Films.
     */
    cursor?: FilmWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Films from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Films.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Films.
     */
    distinct?: FilmScalarFieldEnum | FilmScalarFieldEnum[]
  }

  /**
   * Film findFirstOrThrow
   */
  export type FilmFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Film
     */
    select?: FilmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Film
     */
    omit?: FilmOmit<ExtArgs> | null
    /**
     * Filter, which Film to fetch.
     */
    where?: FilmWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Films to fetch.
     */
    orderBy?: FilmOrderByWithRelationInput | FilmOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Films.
     */
    cursor?: FilmWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Films from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Films.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Films.
     */
    distinct?: FilmScalarFieldEnum | FilmScalarFieldEnum[]
  }

  /**
   * Film findMany
   */
  export type FilmFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Film
     */
    select?: FilmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Film
     */
    omit?: FilmOmit<ExtArgs> | null
    /**
     * Filter, which Films to fetch.
     */
    where?: FilmWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Films to fetch.
     */
    orderBy?: FilmOrderByWithRelationInput | FilmOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Films.
     */
    cursor?: FilmWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Films from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Films.
     */
    skip?: number
    distinct?: FilmScalarFieldEnum | FilmScalarFieldEnum[]
  }

  /**
   * Film create
   */
  export type FilmCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Film
     */
    select?: FilmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Film
     */
    omit?: FilmOmit<ExtArgs> | null
    /**
     * The data needed to create a Film.
     */
    data: XOR<FilmCreateInput, FilmUncheckedCreateInput>
  }

  /**
   * Film createMany
   */
  export type FilmCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Films.
     */
    data: FilmCreateManyInput | FilmCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Film createManyAndReturn
   */
  export type FilmCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Film
     */
    select?: FilmSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Film
     */
    omit?: FilmOmit<ExtArgs> | null
    /**
     * The data used to create many Films.
     */
    data: FilmCreateManyInput | FilmCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Film update
   */
  export type FilmUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Film
     */
    select?: FilmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Film
     */
    omit?: FilmOmit<ExtArgs> | null
    /**
     * The data needed to update a Film.
     */
    data: XOR<FilmUpdateInput, FilmUncheckedUpdateInput>
    /**
     * Choose, which Film to update.
     */
    where: FilmWhereUniqueInput
  }

  /**
   * Film updateMany
   */
  export type FilmUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Films.
     */
    data: XOR<FilmUpdateManyMutationInput, FilmUncheckedUpdateManyInput>
    /**
     * Filter which Films to update
     */
    where?: FilmWhereInput
    /**
     * Limit how many Films to update.
     */
    limit?: number
  }

  /**
   * Film updateManyAndReturn
   */
  export type FilmUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Film
     */
    select?: FilmSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Film
     */
    omit?: FilmOmit<ExtArgs> | null
    /**
     * The data used to update Films.
     */
    data: XOR<FilmUpdateManyMutationInput, FilmUncheckedUpdateManyInput>
    /**
     * Filter which Films to update
     */
    where?: FilmWhereInput
    /**
     * Limit how many Films to update.
     */
    limit?: number
  }

  /**
   * Film upsert
   */
  export type FilmUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Film
     */
    select?: FilmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Film
     */
    omit?: FilmOmit<ExtArgs> | null
    /**
     * The filter to search for the Film to update in case it exists.
     */
    where: FilmWhereUniqueInput
    /**
     * In case the Film found by the `where` argument doesn't exist, create a new Film with this data.
     */
    create: XOR<FilmCreateInput, FilmUncheckedCreateInput>
    /**
     * In case the Film was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FilmUpdateInput, FilmUncheckedUpdateInput>
  }

  /**
   * Film delete
   */
  export type FilmDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Film
     */
    select?: FilmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Film
     */
    omit?: FilmOmit<ExtArgs> | null
    /**
     * Filter which Film to delete.
     */
    where: FilmWhereUniqueInput
  }

  /**
   * Film deleteMany
   */
  export type FilmDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Films to delete
     */
    where?: FilmWhereInput
    /**
     * Limit how many Films to delete.
     */
    limit?: number
  }

  /**
   * Film without action
   */
  export type FilmDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Film
     */
    select?: FilmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Film
     */
    omit?: FilmOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CinemetaScalarFieldEnum: {
    id: 'id',
    info: 'info',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CinemetaScalarFieldEnum = (typeof CinemetaScalarFieldEnum)[keyof typeof CinemetaScalarFieldEnum]


  export const ConfigScalarFieldEnum: {
    id: 'id',
    config: 'config',
    metadata: 'metadata',
    isReserved: 'isReserved',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ConfigScalarFieldEnum = (typeof ConfigScalarFieldEnum)[keyof typeof ConfigScalarFieldEnum]


  export const FilmScalarFieldEnum: {
    id: 'id',
    title: 'title',
    year: 'year',
    runtime: 'runtime',
    description: 'description',
    genres: 'genres',
    director: 'director',
    cast: 'cast',
    imdb: 'imdb',
    tmdb: 'tmdb',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FilmScalarFieldEnum = (typeof FilmScalarFieldEnum)[keyof typeof FilmScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type CinemetaWhereInput = {
    AND?: CinemetaWhereInput | CinemetaWhereInput[]
    OR?: CinemetaWhereInput[]
    NOT?: CinemetaWhereInput | CinemetaWhereInput[]
    id?: StringFilter<"Cinemeta"> | string
    info?: StringFilter<"Cinemeta"> | string
    createdAt?: DateTimeFilter<"Cinemeta"> | Date | string
    updatedAt?: DateTimeFilter<"Cinemeta"> | Date | string
  }

  export type CinemetaOrderByWithRelationInput = {
    id?: SortOrder
    info?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CinemetaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CinemetaWhereInput | CinemetaWhereInput[]
    OR?: CinemetaWhereInput[]
    NOT?: CinemetaWhereInput | CinemetaWhereInput[]
    info?: StringFilter<"Cinemeta"> | string
    createdAt?: DateTimeFilter<"Cinemeta"> | Date | string
    updatedAt?: DateTimeFilter<"Cinemeta"> | Date | string
  }, "id">

  export type CinemetaOrderByWithAggregationInput = {
    id?: SortOrder
    info?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CinemetaCountOrderByAggregateInput
    _max?: CinemetaMaxOrderByAggregateInput
    _min?: CinemetaMinOrderByAggregateInput
  }

  export type CinemetaScalarWhereWithAggregatesInput = {
    AND?: CinemetaScalarWhereWithAggregatesInput | CinemetaScalarWhereWithAggregatesInput[]
    OR?: CinemetaScalarWhereWithAggregatesInput[]
    NOT?: CinemetaScalarWhereWithAggregatesInput | CinemetaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Cinemeta"> | string
    info?: StringWithAggregatesFilter<"Cinemeta"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Cinemeta"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Cinemeta"> | Date | string
  }

  export type ConfigWhereInput = {
    AND?: ConfigWhereInput | ConfigWhereInput[]
    OR?: ConfigWhereInput[]
    NOT?: ConfigWhereInput | ConfigWhereInput[]
    id?: StringFilter<"Config"> | string
    config?: StringFilter<"Config"> | string
    metadata?: StringFilter<"Config"> | string
    isReserved?: BoolFilter<"Config"> | boolean
    createdAt?: DateTimeFilter<"Config"> | Date | string
    updatedAt?: DateTimeFilter<"Config"> | Date | string
  }

  export type ConfigOrderByWithRelationInput = {
    id?: SortOrder
    config?: SortOrder
    metadata?: SortOrder
    isReserved?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConfigWhereInput | ConfigWhereInput[]
    OR?: ConfigWhereInput[]
    NOT?: ConfigWhereInput | ConfigWhereInput[]
    config?: StringFilter<"Config"> | string
    metadata?: StringFilter<"Config"> | string
    isReserved?: BoolFilter<"Config"> | boolean
    createdAt?: DateTimeFilter<"Config"> | Date | string
    updatedAt?: DateTimeFilter<"Config"> | Date | string
  }, "id">

  export type ConfigOrderByWithAggregationInput = {
    id?: SortOrder
    config?: SortOrder
    metadata?: SortOrder
    isReserved?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ConfigCountOrderByAggregateInput
    _max?: ConfigMaxOrderByAggregateInput
    _min?: ConfigMinOrderByAggregateInput
  }

  export type ConfigScalarWhereWithAggregatesInput = {
    AND?: ConfigScalarWhereWithAggregatesInput | ConfigScalarWhereWithAggregatesInput[]
    OR?: ConfigScalarWhereWithAggregatesInput[]
    NOT?: ConfigScalarWhereWithAggregatesInput | ConfigScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Config"> | string
    config?: StringWithAggregatesFilter<"Config"> | string
    metadata?: StringWithAggregatesFilter<"Config"> | string
    isReserved?: BoolWithAggregatesFilter<"Config"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Config"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Config"> | Date | string
  }

  export type FilmWhereInput = {
    AND?: FilmWhereInput | FilmWhereInput[]
    OR?: FilmWhereInput[]
    NOT?: FilmWhereInput | FilmWhereInput[]
    id?: StringFilter<"Film"> | string
    title?: StringFilter<"Film"> | string
    year?: IntFilter<"Film"> | number
    runtime?: IntFilter<"Film"> | number
    description?: StringFilter<"Film"> | string
    genres?: StringFilter<"Film"> | string
    director?: StringFilter<"Film"> | string
    cast?: StringFilter<"Film"> | string
    imdb?: StringNullableFilter<"Film"> | string | null
    tmdb?: StringFilter<"Film"> | string
    createdAt?: DateTimeFilter<"Film"> | Date | string
    updatedAt?: DateTimeFilter<"Film"> | Date | string
  }

  export type FilmOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    year?: SortOrder
    runtime?: SortOrder
    description?: SortOrder
    genres?: SortOrder
    director?: SortOrder
    cast?: SortOrder
    imdb?: SortOrderInput | SortOrder
    tmdb?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FilmWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FilmWhereInput | FilmWhereInput[]
    OR?: FilmWhereInput[]
    NOT?: FilmWhereInput | FilmWhereInput[]
    title?: StringFilter<"Film"> | string
    year?: IntFilter<"Film"> | number
    runtime?: IntFilter<"Film"> | number
    description?: StringFilter<"Film"> | string
    genres?: StringFilter<"Film"> | string
    director?: StringFilter<"Film"> | string
    cast?: StringFilter<"Film"> | string
    imdb?: StringNullableFilter<"Film"> | string | null
    tmdb?: StringFilter<"Film"> | string
    createdAt?: DateTimeFilter<"Film"> | Date | string
    updatedAt?: DateTimeFilter<"Film"> | Date | string
  }, "id">

  export type FilmOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    year?: SortOrder
    runtime?: SortOrder
    description?: SortOrder
    genres?: SortOrder
    director?: SortOrder
    cast?: SortOrder
    imdb?: SortOrderInput | SortOrder
    tmdb?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FilmCountOrderByAggregateInput
    _avg?: FilmAvgOrderByAggregateInput
    _max?: FilmMaxOrderByAggregateInput
    _min?: FilmMinOrderByAggregateInput
    _sum?: FilmSumOrderByAggregateInput
  }

  export type FilmScalarWhereWithAggregatesInput = {
    AND?: FilmScalarWhereWithAggregatesInput | FilmScalarWhereWithAggregatesInput[]
    OR?: FilmScalarWhereWithAggregatesInput[]
    NOT?: FilmScalarWhereWithAggregatesInput | FilmScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Film"> | string
    title?: StringWithAggregatesFilter<"Film"> | string
    year?: IntWithAggregatesFilter<"Film"> | number
    runtime?: IntWithAggregatesFilter<"Film"> | number
    description?: StringWithAggregatesFilter<"Film"> | string
    genres?: StringWithAggregatesFilter<"Film"> | string
    director?: StringWithAggregatesFilter<"Film"> | string
    cast?: StringWithAggregatesFilter<"Film"> | string
    imdb?: StringNullableWithAggregatesFilter<"Film"> | string | null
    tmdb?: StringWithAggregatesFilter<"Film"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Film"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Film"> | Date | string
  }

  export type CinemetaCreateInput = {
    id: string
    info: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CinemetaUncheckedCreateInput = {
    id: string
    info: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CinemetaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    info?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CinemetaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    info?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CinemetaCreateManyInput = {
    id: string
    info: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CinemetaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    info?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CinemetaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    info?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfigCreateInput = {
    id?: string
    config: string
    metadata: string
    isReserved?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConfigUncheckedCreateInput = {
    id?: string
    config: string
    metadata: string
    isReserved?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    metadata?: StringFieldUpdateOperationsInput | string
    isReserved?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    metadata?: StringFieldUpdateOperationsInput | string
    isReserved?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfigCreateManyInput = {
    id?: string
    config: string
    metadata: string
    isReserved?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    metadata?: StringFieldUpdateOperationsInput | string
    isReserved?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    config?: StringFieldUpdateOperationsInput | string
    metadata?: StringFieldUpdateOperationsInput | string
    isReserved?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilmCreateInput = {
    id: string
    title: string
    year: number
    runtime: number
    description: string
    genres: string
    director: string
    cast: string
    imdb?: string | null
    tmdb: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FilmUncheckedCreateInput = {
    id: string
    title: string
    year: number
    runtime: number
    description: string
    genres: string
    director: string
    cast: string
    imdb?: string | null
    tmdb: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FilmUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    runtime?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    genres?: StringFieldUpdateOperationsInput | string
    director?: StringFieldUpdateOperationsInput | string
    cast?: StringFieldUpdateOperationsInput | string
    imdb?: NullableStringFieldUpdateOperationsInput | string | null
    tmdb?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilmUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    runtime?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    genres?: StringFieldUpdateOperationsInput | string
    director?: StringFieldUpdateOperationsInput | string
    cast?: StringFieldUpdateOperationsInput | string
    imdb?: NullableStringFieldUpdateOperationsInput | string | null
    tmdb?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilmCreateManyInput = {
    id: string
    title: string
    year: number
    runtime: number
    description: string
    genres: string
    director: string
    cast: string
    imdb?: string | null
    tmdb: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FilmUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    runtime?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    genres?: StringFieldUpdateOperationsInput | string
    director?: StringFieldUpdateOperationsInput | string
    cast?: StringFieldUpdateOperationsInput | string
    imdb?: NullableStringFieldUpdateOperationsInput | string | null
    tmdb?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilmUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    runtime?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    genres?: StringFieldUpdateOperationsInput | string
    director?: StringFieldUpdateOperationsInput | string
    cast?: StringFieldUpdateOperationsInput | string
    imdb?: NullableStringFieldUpdateOperationsInput | string | null
    tmdb?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CinemetaCountOrderByAggregateInput = {
    id?: SortOrder
    info?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CinemetaMaxOrderByAggregateInput = {
    id?: SortOrder
    info?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CinemetaMinOrderByAggregateInput = {
    id?: SortOrder
    info?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ConfigCountOrderByAggregateInput = {
    id?: SortOrder
    config?: SortOrder
    metadata?: SortOrder
    isReserved?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    config?: SortOrder
    metadata?: SortOrder
    isReserved?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConfigMinOrderByAggregateInput = {
    id?: SortOrder
    config?: SortOrder
    metadata?: SortOrder
    isReserved?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type FilmCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    year?: SortOrder
    runtime?: SortOrder
    description?: SortOrder
    genres?: SortOrder
    director?: SortOrder
    cast?: SortOrder
    imdb?: SortOrder
    tmdb?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FilmAvgOrderByAggregateInput = {
    year?: SortOrder
    runtime?: SortOrder
  }

  export type FilmMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    year?: SortOrder
    runtime?: SortOrder
    description?: SortOrder
    genres?: SortOrder
    director?: SortOrder
    cast?: SortOrder
    imdb?: SortOrder
    tmdb?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FilmMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    year?: SortOrder
    runtime?: SortOrder
    description?: SortOrder
    genres?: SortOrder
    director?: SortOrder
    cast?: SortOrder
    imdb?: SortOrder
    tmdb?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FilmSumOrderByAggregateInput = {
    year?: SortOrder
    runtime?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}