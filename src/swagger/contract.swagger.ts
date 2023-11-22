// #swagger.start
/*
  #swagger.tags = ['Contract']
  #swagger.path = '/contracts/all/'
  #swagger.method = 'get'
  #swagger.summary = 'Get all contracts with optional filter status'
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
  #swagger.path = '/contracts/odrl/{id}'
  #swagger.method = 'get'
  #swagger.summary = 'Get ODRL contract by ID'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the ODRL contract',
    required: true,
    type: 'string'
  }
  #swagger.responses[200] = {
    description: 'ODRL contract details',
    schema: { $ref: '#/definitions/ODRLContract' }
  }
  #swagger.responses[404] = {
    description: 'ODRL contract not found.',
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
  #swagger.path = '/contracts/check-exploitability/{id}'
  #swagger.method = 'post'
  #swagger.summary = 'Check data exploitability for a contract'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract',
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
  #swagger.method = 'post'
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
  #swagger.method = 'post'
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
    schema: { $ref: '#/definitions/PoliciesInjections' }
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
  #swagger.method = 'post'
  #swagger.summary = 'Inject policies for a role into a contract'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract',
    required: true,
    type: 'string'
  }
  #swagger.parameters['policies'] = {
    in: 'body',
    description: 'Array of policy data for the role.',
    required: true,
    schema: { $ref: '#/definitions/PoliciesInjections' }
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
