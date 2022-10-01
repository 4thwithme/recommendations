import { QueryResult } from "neo4j-driver";
import { driver, getSession } from "./graph-connection";

export class Graph {
  public static async txRead(
    readQuery: string,
    params?: Record<string, unknown>
  ): Promise<QueryResult | undefined> {
    const session = await getSession({ driver });

    try {
      return await session?.executeRead((tx) => tx.run(readQuery, params));
    } catch (error) {
      console.error(`Something went wrong: ${error}`);
    } finally {
      console.log("END executeRead");
      await session?.close();
    }
  }

  public static async txWrite(
    writeQuery: string,
    params?: Record<string, unknown>
  ): Promise<QueryResult | undefined> {
    const session = await getSession({ driver });

    try {
      return await session?.executeWrite((tx) => tx.run(writeQuery, params));
    } catch (error) {
      console.error(`Something went wrong: ${error}`);
    } finally {
      console.log("END executeWrite");
      await session?.close();
    }
  }
}
