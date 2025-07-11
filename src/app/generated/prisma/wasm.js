
/* !!! This is code generated by Prisma. Do not edit directly. !!!
/* eslint-disable */

Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.9.0
 * Query Engine version: 81e4af48011447c3cc503a190e86995b66d2a28e
 */
Prisma.prismaVersion = {
  client: "6.9.0",
  engine: "81e4af48011447c3cc503a190e86995b66d2a28e"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.BrregBusinessScalarFieldEnum = {
  id: 'id',
  orgNumber: 'orgNumber',
  name: 'name',
  orgFormCode: 'orgFormCode',
  orgFormDesc: 'orgFormDesc',
  naceCode1: 'naceCode1',
  naceDesc1: 'naceDesc1',
  naceCode2: 'naceCode2',
  naceDesc2: 'naceDesc2',
  naceCode3: 'naceCode3',
  naceDesc3: 'naceDesc3',
  industrySection: 'industrySection',
  industrySectionName: 'industrySectionName',
  email: 'email',
  phone: 'phone',
  mobile: 'mobile',
  website: 'website',
  businessAddress: 'businessAddress',
  businessCity: 'businessCity',
  businessPostalCode: 'businessPostalCode',
  businessMunicipality: 'businessMunicipality',
  businessMunicipalityCode: 'businessMunicipalityCode',
  postalAddress: 'postalAddress',
  postalCity: 'postalCity',
  postalPostalCode: 'postalPostalCode',
  postalMunicipality: 'postalMunicipality',
  postalMunicipalityCode: 'postalMunicipalityCode',
  hasRegisteredEmployees: 'hasRegisteredEmployees',
  numberOfEmployees: 'numberOfEmployees',
  establishedDate: 'establishedDate',
  registeredDate: 'registeredDate',
  vatRegistered: 'vatRegistered',
  isBankrupt: 'isBankrupt',
  isWindingUp: 'isWindingUp',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessScalarFieldEnum = {
  id: 'id',
  name: 'name',
  orgNumber: 'orgNumber',
  address: 'address',
  postalCode: 'postalCode',
  city: 'city',
  country: 'country',
  contactPerson: 'contactPerson',
  email: 'email',
  phone: 'phone',
  website: 'website',
  industry: 'industry',
  numberOfEmployees: 'numberOfEmployees',
  revenue: 'revenue',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  bilagCount: 'bilagCount',
  status: 'status',
  stage: 'stage',
  potensiellVerdi: 'potensiellVerdi',
  orgForm: 'orgForm',
  industryCode: 'industryCode',
  vatRegistered: 'vatRegistered',
  establishedDate: 'establishedDate',
  isBankrupt: 'isBankrupt',
  isWindingUp: 'isWindingUp',
  brregUpdatedAt: 'brregUpdatedAt',
  brregOrgNumber: 'brregOrgNumber',
  workspaceId: 'workspaceId'
};

exports.Prisma.TagScalarFieldEnum = {
  id: 'id',
  name: 'name',
  workspaceId: 'workspaceId'
};

exports.Prisma.ContactScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  position: 'position',
  isPrimary: 'isPrimary',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  businessId: 'businessId',
  workspaceId: 'workspaceId'
};

exports.Prisma.ActivityScalarFieldEnum = {
  id: 'id',
  type: 'type',
  date: 'date',
  description: 'description',
  completed: 'completed',
  outcome: 'outcome',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  businessId: 'businessId',
  contactId: 'contactId',
  jobApplicationId: 'jobApplicationId',
  userId: 'userId',
  workspaceId: 'workspaceId'
};

exports.Prisma.OfferScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt',
  status: 'status',
  totalAmount: 'totalAmount',
  currency: 'currency',
  notes: 'notes',
  updatedAt: 'updatedAt',
  businessId: 'businessId',
  contactId: 'contactId',
  workspaceId: 'workspaceId'
};

exports.Prisma.OfferItemScalarFieldEnum = {
  id: 'id',
  description: 'description',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  discount: 'discount',
  tax: 'tax',
  total: 'total',
  offerId: 'offerId'
};

exports.Prisma.EmailScalarFieldEnum = {
  id: 'id',
  subject: 'subject',
  senderEmail: 'senderEmail',
  senderName: 'senderName',
  recipientEmail: 'recipientEmail',
  recipientName: 'recipientName',
  content: 'content',
  htmlContent: 'htmlContent',
  receivedAt: 'receivedAt',
  attachments: 'attachments',
  messageId: 'messageId',
  inReplyTo: 'inReplyTo',
  priority: 'priority',
  isRead: 'isRead',
  isImportant: 'isImportant',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  businessId: 'businessId',
  contactId: 'contactId',
  workspaceId: 'workspaceId'
};

exports.Prisma.JobApplicationScalarFieldEnum = {
  id: 'id',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  address: 'address',
  postalCode: 'postalCode',
  city: 'city',
  country: 'country',
  resume: 'resume',
  coverLetter: 'coverLetter',
  experience: 'experience',
  education: 'education',
  skills: 'skills',
  desiredPosition: 'desiredPosition',
  currentEmployer: 'currentEmployer',
  expectedSalary: 'expectedSalary',
  startDate: 'startDate',
  notes: 'notes',
  source: 'source',
  applicationDate: 'applicationDate',
  updatedAt: 'updatedAt',
  status: 'status',
  workspaceId: 'workspaceId'
};

exports.Prisma.TaskScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  status: 'status',
  priority: 'priority',
  dueDate: 'dueDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  workspaceId: 'workspaceId',
  businessId: 'businessId',
  creatorId: 'creatorId',
  userId: 'userId'
};

exports.Prisma.WorkspaceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  apiKey: 'apiKey'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  clerkId: 'clerkId',
  email: 'email',
  name: 'name',
  isAdmin: 'isAdmin',
  passwordHash: 'passwordHash',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.BusinessStatus = exports.$Enums.BusinessStatus = {
  active: 'active',
  inactive: 'inactive'
};

exports.CustomerStage = exports.$Enums.CustomerStage = {
  lead: 'lead',
  prospect: 'prospect',
  qualified: 'qualified',
  customer: 'customer',
  churned: 'churned'
};

exports.ActivityType = exports.$Enums.ActivityType = {
  call: 'call',
  meeting: 'meeting',
  email: 'email',
  note: 'note'
};

exports.OfferStatus = exports.$Enums.OfferStatus = {
  draft: 'draft',
  sent: 'sent',
  accepted: 'accepted',
  rejected: 'rejected',
  expired: 'expired'
};

exports.JobApplicationStatus = exports.$Enums.JobApplicationStatus = {
  new: 'new',
  reviewing: 'reviewing',
  interviewed: 'interviewed',
  offer_extended: 'offer_extended',
  hired: 'hired',
  rejected: 'rejected'
};

exports.TaskStatus = exports.$Enums.TaskStatus = {
  ikke_startet: 'ikke_startet',
  pabegynt: 'pabegynt',
  ferdig: 'ferdig'
};

exports.TaskPriority = exports.$Enums.TaskPriority = {
  low: 'low',
  medium: 'medium',
  high: 'high'
};

exports.Prisma.ModelName = {
  BrregBusiness: 'BrregBusiness',
  Business: 'Business',
  Tag: 'Tag',
  Contact: 'Contact',
  Activity: 'Activity',
  Offer: 'Offer',
  OfferItem: 'OfferItem',
  Email: 'Email',
  JobApplication: 'JobApplication',
  Task: 'Task',
  Workspace: 'Workspace',
  User: 'User'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
