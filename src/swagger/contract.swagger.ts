// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/all/'
  #swagger.method = 'get'
  #swagger.summary = 'Get all contracts with optional filter on the contract status'
  #swagger.parameters['status'] = {
    in: 'query',
    description: 'Status of the contract.',
    required: false,
    type: 'string',
    enum: ['signed', 'revoked', 'pending']
  }
  #swagger.responses[200] = {
    description: 'List of contracts',
    schema: { $ref: '#/definitions/ContractsList' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/for/{did}'
  #swagger.method = 'get'
  #swagger.summary = 'Get contracts for a specific DID with an optional filter'
  #swagger.parameters['did'] = {
    in: 'path',
    description: 'DID of the participant',
    required: true,
    type: 'string'
  }
  #swagger.parameters['hasSigned'] = {
    in: 'query',
    description: 'Filter contracts based on signature status',
    required: false,
    type: 'boolean'
  }
  #swagger.responses[200] = {
    description: 'List of contracts',
    schema: { $ref: '#/definitions/ContractsList' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/'
  #swagger.method = 'post'
  #swagger.summary = 'Create a new contract'
  #swagger.parameters['contract'] = {
    in: 'body',
    description: 'Contract data for creation.',
    required: true,
    schema: { $ref: '#/definitions/InputContract' }
  }
  #swagger.responses[201] = {
    description: 'Newly created contract',
    schema: { $ref: '#/definitions/Contract' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/{id}'
  #swagger.method = 'get'
  #swagger.summary = 'Get contract by ID'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract',
    required: true,
    type: 'string'
  }
  #swagger.responses[200] = {
    description: 'Contract details',
    schema: { $ref: '#/definitions/Contract' }
  }
  #swagger.responses[404] = {
    description: 'Contract not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/serviceoffering/{id}'
  #swagger.method = 'get'
  #swagger.summary = 'Get the policies for a given service offering'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract',
    required: true,
    type: 'string'
  }
  #swagger.parameters['participant'] = {
    in: 'query',
    description: 'ID of the participant',
    required: true,
    type: 'string'
  }
  #swagger.parameters['serviceOffering'] = {
    in: 'query',
    description: 'ID of the service offering',
    required: true,
    type: 'string'
  }
  #swagger.responses[200] = {
    description: 'An array of policies related to the service offering',
    schema: {
      type: 'array',
      items: { $ref: '#/definitions/ContractPolicy' }
    }
  }
  #swagger.responses[404] = {
    description: 'Contract not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/{id}'
  #swagger.method = 'put'
  #swagger.summary = 'Update an existing contract by ID'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract to update',
    required: true,
    type: 'string'
  }
  #swagger.parameters['contract'] = {
    in: 'body',
    description: 'Updated contract data.',
    required: true,
    schema: { $ref: '#/definitions/Contract' }
  }
  #swagger.responses[200] = {
    description: 'Updated contract details',
    schema: { $ref: '#/definitions/Contract' }
  }
  #swagger.responses[400] = {
    description: 'Bad request, invalid data.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[404] = {
    description: 'Contract not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/sign/{id}'
  #swagger.method = 'put'
  #swagger.summary = 'Sign an existing contract by ID'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract to sign',
    required: true,
    type: 'string'
  }
  #swagger.parameters['signature'] = {
    in: 'body',
    description: '',
    required: true,
    schema: { $ref: '#/definitions/Signature' }
  }
  #swagger.responses[200] = {
    description: 'Contract successfully signed',
    schema: { $ref: '#/definitions/Contract' }
  }
  #swagger.responses[404] = {
    description: 'Contract not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/sign/revoke/{id}/{did}'
  #swagger.method = 'delete'
  #swagger.summary = 'Revoke the signature of a participant on a contract'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract',
    required: true,
    type: 'string'
  }
  #swagger.parameters['did'] = {
    in: 'path',
    description: 'DID of the participant',
    required: true,
    type: 'string'
  }
  #swagger.responses[200] = {
    description: 'Signature revoked successfully',
    schema: { $ref: '#/definitions/Contract' }
  }
  #swagger.responses[404] = {
    description: 'Contract or participant not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/role/exploitability/{id}/{role}'
  #swagger.method = 'post'
  #swagger.summary = 'Check data exploitability for a contract'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract',
    required: true,
    type: 'string'
  }
  #swagger.parameters['role'] = {
    in: 'path',
    description: 'ID of the related role',
    required: true,
    type: 'string'
  }
  #swagger.responses[200] = {
    description: 'Exploitability check result',
    schema: { $ref: '#/definitions/ExploitabilityResult' }
  }
  #swagger.responses[404] = {
    description: 'Contract not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/policy/{id}'
  #swagger.method = 'put'
  #swagger.summary = 'Inject a policy into a contract'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract',
    required: true,
    type: 'string'
  }
  #swagger.parameters['policy'] = {
    in: 'body',
    description: 'Policy data.',
    required: true,
    schema: { $ref: '#/definitions/PolicyInjection' }
  }
  #swagger.responses[200] = {
    description: 'Policy successfully injected',
    schema: { $ref: '#/definitions/Contract' }
  }
  #swagger.responses[400] = {
    description: 'Bad request, invalid data.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[404] = {
    description: 'Contract not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/policies/{id}'
  #swagger.method = 'put'
  #swagger.summary = 'Inject multiple policies into a contract'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract',
    required: true,
    type: 'string'
  }
  #swagger.parameters['policies'] = {
    in: 'body',
    description: 'Array of policy data.',
    required: true,
    schema: {
      type: 'array',
      items: { $ref: '#/definitions/PolicyInjection' }
    }
  }
  #swagger.responses[200] = {
    description: 'Policies successfully injected',
    schema: { $ref: '#/definitions/Contract' }
  }
  #swagger.responses[400] = {
    description: 'Bad request, invalid data.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[404] = {
    description: 'Contract not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/policies/role/{id}'
  #swagger.method = 'put'
  #swagger.summary = 'Inject policies for a role into a contract'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract',
    required: true,
    type: 'string'
  }
  #swagger.parameters['policies'] = {
    in: 'body',
    description: 'Array of policy data for a given role.',
    required: true,
    schema: {
      type: 'object',
      role: 'string',
      policies: {
        type: 'array',
        items: { $ref: '#/definitions/PolicyRoleInjection' }
      }
    }
  }
  #swagger.responses[200] = {
    description: 'Policies for role successfully injected',
    schema: { $ref: '#/definitions/Contract' }
  }
  #swagger.responses[400] = {
    description: 'Bad request, invalid data.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[404] = {
    description: 'Contract not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/policies/roles/{id}'
  #swagger.method = 'put'
  #swagger.summary = 'Inject policies for specified groups of role'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract',
    required: true,
    type: 'string'
  }
  #swagger.parameters['policies'] = {
    in: 'body',
    description: 'Array of policies associated with a group of roles.',
    required: true,
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          roles: { type: 'array', items: { type: 'string' } },
          policies: {
            type: 'array',
            items: { $ref: '#/definitions/PolicyRoleInjection' }
          }
        },
        required: ['roles', 'policies']
      }
    }
  }
  #swagger.responses[200] = {
    description: 'Policies for role successfully injected',
    schema: { $ref: '#/definitions/Contract' }
  }
  #swagger.responses[400] = {
    description: 'Bad request, invalid data.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[404] = {
    description: 'Contract not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/policies/offering/{id}'
  #swagger.method = 'put'
  #swagger.summary = 'Inject policies for an offering into a contract'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract',
    required: true,
    type: 'string'
  }
  #swagger.parameters['policies'] = {
    in: 'body',
    description: 'Array of policy data for a given role.',
    required: true,
    schema: {
      type: 'object',
      participant: 'string',
      serviceOffering: 'string',
      policies: {
        type: 'array',
        items: { $ref: '#/definitions/PolicyRoleInjection' }
      }
    }
  }
  #swagger.responses[200] = {
    description: 'Policies for role successfully injected',
    schema: { $ref: '#/definitions/Contract' }
  }
  #swagger.responses[400] = {
    description: 'Bad request, invalid data.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[404] = {
    description: 'Contract not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/policies/offering/{contractId}/{offeringId}/{participantId}'
  #swagger.method = 'delete'
  #swagger.summary = 'Remove policies associated with a specific offering/participant pair from a contract based on their IDs.'
  #swagger.parameters['contractId'] = {
    in: 'path',
    description: 'ID of the contract',
    required: true,
    type: 'string'
  }
  #swagger.parameters['offeringId'] = {
    in: 'path',
    description: 'ID of the service offering',
    required: true,
    type: 'string'
  }
  #swagger.parameters['participantId'] = {
    in: 'path',
    description: 'ID of the participant',
    required: true,
    type: 'string'
  }
  #swagger.responses[200] = {
    description: 'Policies for role successfully injected',
    schema: { $ref: '#/definitions/Contract' }
  }
  #swagger.responses[400] = {
    description: 'Bad request, invalid data.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[404] = {
    description: 'Contract not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end
