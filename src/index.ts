import { driver, closeConnnection } from "./graph-connection";
import { Graph } from "./graph-queries";
import { client, mdb } from "./mdb-connection";

(async () => {
  try {
    // await createRoleNodes()
    // await createTenantNodes()
    await createUserNodesWithTenantAndRoleRelations();

    const nodes = await Graph.txRead("MATCH (t:Tenant) RETURN t");
    console.log("nodes", JSON.stringify(nodes?.records));
  } catch (error) {
    console.error(`Something went wrong: ${error}`);
  } finally {
    await client.close();
    await closeConnnection({ driver });
  }
})();

// helpers --------------------------------------------

// async function createRoleNodes() {
//   const roles = await mdb
//     .collection("users")
//     .aggregate([
//       { $group: { _id: "$role" } },
//       { $group: { _id: null, roles: { $push: "$_id" } } },
//     ])
//     .toArray();

//   console.log("user", roles);

//   const result = await Promise.all(
//     roles[0].roles.map((role: string) =>
//       Graph.txWrite(
//         `
//             MERGE (r:Role {name: $roleName})
//             RETURN r
//           `,
//         { roleName: role }
//       )
//     )
//   );

//   console.log("result", result);
// }

// async function createTenantNodes() {
//   const tenantsReq = await mdb
//     .collection("users")
//     .aggregate([
//       { $group: { _id: "$tenant" } },
//       { $group: { _id: null, tenants: { $push: "$_id" } } },
//     ])
//     .toArray();

//   console.log(tenantsReq[0].tenants);

//   const result = await Promise.all(
//     tenantsReq[0].tenants.map((tenant: string) =>
//       Graph.txWrite(
//         `
//         MERGE (t:Tenant {name: $tenantName})
//         RETURN t
//       `,
//         { tenantName: tenant }
//       )
//     )
//   );

//   console.log("result", result);
// }

async function createUserNodesWithTenantAndRoleRelations() {
  const users = mdb
    .collection("users")
    .aggregate([{ $project: { _id: 1, tenant: 1, email: 1, role: 1 } }])
    .batchSize(10);

  let i = 0;
  for await (const user of users) {
    const { _id, tenant, email, role } = user;
    console.log(i++);

    await Graph.txWrite(
      `
        MATCH (r:Role) WHERE r.name = $role
        MATCH (t:Tenant) WHERE t.name = $tenant
        MERGE (p:Person {_id: $_id, name: $email})-[h:HAS_ROLE]->(r)
        MERGE (p)-[o:HAS_TENANT]->(t)
        RETURN p
      `,
      { role, tenant, email, _id: String(_id) }
    );
  }
}
