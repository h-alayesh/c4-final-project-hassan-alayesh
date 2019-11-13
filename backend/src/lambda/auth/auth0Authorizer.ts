import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJOHLFYSDd+LvyMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi0tM3Vpdjllby5hdXRoMC5jb20wHhcNMTkxMDI4MTE1NjE1WhcNMzMw
NzA2MTE1NjE1WjAhMR8wHQYDVQQDExZkZXYtLTN1aXY5ZW8uYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0IYsv82UtadNSbzo/prv69Tk
O7HOPAFeCm1PgBkwT452O4bQAEiWP+3Acq0lX43nK4XQ+B/3HtC1HsEm56Mo82dU
teDK0R2EV2s7CYm5Lx1h9NS/Ublua4U4Az2S4BclI6XGudH6jF8SqWbUdsj40lE0
7AF60zbAqyvpVZkhNM4xilVH2/aWln2C9xmJUGGaw5SQ7EIjQ8sUuNmFVgVyOnTn
MoD2+YgOATipavZDz209do8B5IsUK45WIQx8rqohepsU198A/3dOEdbPb7nsmo/J
1NlI0RWZ4IwIp21ZuaCyE19ZhZ6XIgLktGqMGeX9ebexXatEUWhAwRrhprY//wID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBR+ygjtd4bKxdCvqHFK
VUGFuSKKazAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBABI6VHw5
svfceGqy6kMIaJS8EY5+zYoTAw5whyFjS9yo07cNDxyxXWOv4g7MTG2KS917RABN
zcd86aVBWthQMQpRrQ+0Q3MK3YYmXX2FTcZJQ8/o9FS3YRK8yi+ncGzzrmF4cNk3
v6ILQ0q+QJWnewJjmsiwshe1VI+SVOpJC4eECpo52gybn4h/OIxGRTk/CR+ZEkah
ZJqzlMh9fg6ykLzHGwumHwv8AuUj5w0SvbvskKu/0Gm+WKFwe19cDwxSU8bvWZE4
Qn33kAkgu1Em4qouifipZcrpzIN2eAQwAid7S8xHZSW2MPIhdum8NLZSVNYMk6pE
mlhIvhM3bu+ndGY=
-----END CERTIFICATE-----
`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  // TODO: Implement token verification

      try{
        return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
      
    }
    catch(e2){
        logger.error('User not authorized Using CERT', { error: e2.message })
      return undefined
    }

  
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
