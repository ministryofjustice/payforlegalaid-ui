import config from '../../config'

// This is just to make mocking it in tests easier!
export function isAuthEnabled(){
    return config.auth.isEnabled;
}

// This scope in practice encompanies the User.Read graph scope
export function getScopes(){
    return [ `${config.auth.clientId}/.default`]
}