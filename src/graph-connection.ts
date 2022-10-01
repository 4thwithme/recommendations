import neo4j, { Driver, Session } from "neo4j-driver";

const uri = "bolt://localhost:7687";
const user = "neo4j";
const password = "0303302";
const database = "neo4j";

export const getDriver = (): Driver =>
  neo4j.driver(uri, neo4j.auth.basic(user, password));

export const closeConnnection = async ({
  driver,
}: {
  driver: Driver;
}): Promise<void> => {
  await driver.close();
};

export const getSession = async ({
  driver,
}: {
  driver: Driver;
}): Promise<Session | undefined> => {
  try {
    return driver.session({ database });
  } catch (error) {
    console.log(error);
    await driver.close();
  }
};

export const driver = getDriver();
