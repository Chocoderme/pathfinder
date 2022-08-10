import { CellState, CellType, type Cell } from "@/types/Cell";
import type { Grid } from "@/types/Grid";
import { cloneDeep } from "lodash";

export type AStarOptions = {
  horizontalCost?: number; // default 1;
  verticalCost?: number; // default: 1;
  diagonalCost?: number; // default: 1;
  jumpCost?: number; // default: 1;
  canDiagonal?: boolean; // default: true;
  canJump?: boolean; // default: true;
  swimCost?: number; // default: 2;
  canSwim?: boolean; // default: false;
};
type AStartBuiltOptions = {
  [key in keyof AStarOptions]-?: AStarOptions[key];
};

type ANode = {
  x: number;
  y: number;
  gScore: number;
  fScore: number;
  cameFrom: ANode | undefined;
};

function buildOptions(options?: AStarOptions): AStartBuiltOptions {
  return {
    canDiagonal: options?.canDiagonal ?? true,
    canJump: options?.canJump ?? true,
    horizontalCost: options?.horizontalCost ?? 1,
    verticalCost: options?.verticalCost ?? 1,
    jumpCost: options?.jumpCost ?? 1,
    diagonalCost: options?.diagonalCost ?? 1,
    swimCost: options?.swimCost ?? 2,
    canSwim: options?.canSwim ?? false,
  };
}

/**
 * h is the heuristic function. h(n) estimates the cost to reach goal from node n.
 */
function h(
  grid: Grid,
  position: { x: number; y: number },
  opts: AStartBuiltOptions
): number {
  let endPos: undefined | { x: number; y: number } = undefined;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x][0] === CellType.END) {
        endPos = { x, y };
        break;
      }
    }
  }
  if (!endPos) return 0;
  return (
    Math.abs(endPos.x - position.x) * opts.horizontalCost +
    Math.abs(endPos.y - position.y) * opts.verticalCost
  );
}

function findNeighboors(
  grid: Grid,
  parent: ANode,
  opts: AStartBuiltOptions
): ANode[] {
  const neighboors: ANode[] = [];
  const gridMaxY = grid.length;
  const gridMaxX = grid[0].length;

  // Horizontal movements
  if (parent.x > 0) {
    neighboors.push({
      x: parent.x - 1,
      y: parent.y,
      cameFrom: parent,
      gScore: parent.gScore + opts.horizontalCost,
      fScore:
        parent.gScore +
        opts.horizontalCost +
        h(grid, { x: parent.x - 1, y: parent.y }, opts),
    });
  }
  if (parent.x < gridMaxX - 1) {
    neighboors.push({
      x: parent.x + 1,
      y: parent.y,
      cameFrom: parent,
      gScore: parent.gScore + opts.horizontalCost,
      fScore:
        parent.gScore +
        opts.horizontalCost +
        h(grid, { x: parent.x + 1, y: parent.y }, opts),
    });
  }

  // Vertical movements
  if (parent.y > 0) {
    neighboors.push({
      x: parent.x,
      y: parent.y - 1,
      cameFrom: parent,
      gScore: parent.gScore + opts.verticalCost,
      fScore:
        parent.gScore +
        opts.verticalCost +
        h(grid, { x: parent.x, y: parent.y - 1 }, opts),
    });
  }
  if (parent.y < gridMaxY - 1) {
    neighboors.push({
      x: parent.x,
      y: parent.y + 1,
      cameFrom: parent,
      gScore: parent.gScore + opts.verticalCost,
      fScore:
        parent.gScore +
        opts.verticalCost +
        h(grid, { x: parent.x, y: parent.y + 1 }, opts),
    });
  }

  // diagonal movements
  if (opts.canDiagonal) {
    const poses = [
      { x: parent.x - 1, y: parent.y - 1 },
      { x: parent.x - 1, y: parent.y + 1 },
      { x: parent.x + 1, y: parent.y - 1 },
      { x: parent.x + 1, y: parent.y + 1 },
    ];
    for (const pos of poses) {
      if (pos.x < 0 || pos.y < 0) continue;
      if (pos.x >= gridMaxX || pos.y >= gridMaxY) continue;
      neighboors.push({
        x: pos.x,
        y: pos.y,
        cameFrom: parent,
        gScore: parent.gScore + opts.diagonalCost,
        fScore:
          parent.gScore +
          opts.diagonalCost +
          h(grid, { x: pos.x, y: pos.y }, opts),
      });
    }
  }

  // Check for holes
  if (opts.canJump && grid[parent.y][parent.x][0] !== CellType.WATER) {
    const jumps: ANode[] = [];
    for (const neighboor of neighboors) {
      if (grid[neighboor.y][neighboor.x][0] === CellType.WATER) {
        // JUMP LOGIC
        const directionX = neighboor.x - parent.x;
        const directionY = neighboor.y - parent.y;
        const jumpX = neighboor.x + directionX;
        const jumpY = neighboor.y + directionY;
        if (jumpX < 0 || jumpY < 0) continue;
        if (jumpX >= gridMaxX || jumpY >= gridMaxY) continue;
        jumps.push({
          x: jumpX,
          y: jumpY,
          cameFrom: neighboor,
          gScore: neighboor.gScore + opts.jumpCost,
          fScore:
            neighboor.gScore +
            opts.jumpCost +
            h(grid, { x: jumpX, y: jumpY }, opts),
        });
      }
    }
    neighboors.push(...jumps);
  }

  return neighboors;
}

function next(
  grid: Grid,
  openNodes: ANode[],
  visitedNodes: ANode[],
  opts: AStartBuiltOptions
): boolean | ANode {
  if (
    openNodes.length === 0 &&
    grid.flat(1).find((n) => n[0] === CellType.START)?.[1] ===
      CellState.EXPLORED
  ) {
    return false;
  } else if (openNodes.length === 0) {
    // Find start cell
    let startPos: undefined | { x: number; y: number } = undefined;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x][0] === CellType.START) {
          startPos = { x, y };
          break;
        }
      }
    }
    if (!startPos) return false;
    grid[startPos.y][startPos.x][1] = CellState.EXPLORING;
    openNodes.push({
      cameFrom: undefined,
      x: startPos.x,
      y: startPos.y,
      gScore: 0,
      fScore: h(grid, { x: startPos.x, y: startPos.y }, opts),
    });
  } else {
    // Process closest node in openNodes
    const cheapestNode = openNodes.reduce(
      (a, b) => {
        if (a.fScore === b.fScore) {
          return a.gScore < b.gScore ? a : b;
        }
        return a.fScore < b.fScore ? a : b;
      },
      {
        cameFrom: undefined,
        x: 0,
        y: 0,
        fScore: Number.POSITIVE_INFINITY,
        gScore: Number.POSITIVE_INFINITY,
      }
    );
    if (!cheapestNode) return false;
    // Check if cheapestNode is the end node
    if (grid[cheapestNode.y][cheapestNode.x][0] === CellType.END) {
      // FOUND THE EXIT
      let n: ANode | undefined = cheapestNode;
      while (n !== undefined) {
        grid[n.y][n.x][1] = CellState.SELECTED;
        n = n.cameFrom;
      }
      return cheapestNode;
    }

    // Otherwise, find neighboors and mark them to be processed
    // 1. remove node from openNodes
    const cheapestNodeIndex = openNodes.findIndex(
      (n) => n.x === cheapestNode.x && n.y === cheapestNode.y
    );
    openNodes.splice(cheapestNodeIndex, 1);
    if (
      !visitedNodes.some(
        (n) => n.x === cheapestNode.x && n.y === cheapestNode.y
      )
    ) {
      visitedNodes.push(cheapestNode);
    }
    grid[cheapestNode.y][cheapestNode.x][1] = CellState.EXPLORED;

    // 2. find neighboors
    const neighboors = findNeighboors(grid, cheapestNode, opts);
    for (const neighboor of neighboors) {
      if (grid[neighboor.y][neighboor.x][0] === CellType.START) continue;
      if (grid[neighboor.y][neighboor.x][0] === CellType.WALL) continue;
      if (grid[neighboor.y][neighboor.x][0] === CellType.WATER) {
        if (!opts.canSwim) continue;
        neighboor.gScore += opts.swimCost;
        neighboor.fScore += opts.swimCost;
      }
      const existingNeigboor = openNodes.find(
        (n) => n.x === neighboor.x && n.y === neighboor.y
      );
      if (!existingNeigboor) {
        const alreadyVisited = visitedNodes.find(
          (n) => n.x === neighboor.x && n.y === neighboor.y
        );
        if (!alreadyVisited) {
          openNodes.push(neighboor);
          grid[neighboor.y][neighboor.x][1] = CellState.EXPLORING;
        } else if (neighboor.gScore < alreadyVisited.gScore) {
          alreadyVisited.cameFrom = neighboor.cameFrom;
          alreadyVisited.fScore = neighboor.fScore;
          alreadyVisited.gScore = neighboor.gScore;
          openNodes.push(alreadyVisited);
          grid[neighboor.y][neighboor.x][1] = CellState.EXPLORING;
        }
      } else if (neighboor.gScore < existingNeigboor.gScore) {
        existingNeigboor.cameFrom = neighboor.cameFrom;
        existingNeigboor.fScore = neighboor.fScore;
        existingNeigboor.gScore = neighboor.gScore;
      }
    }
  }

  const nextCheapestNode = openNodes.reduce(
    (a, b) => {
      if (a.fScore === b.fScore) {
        return a.gScore < b.gScore ? a : b;
      }
      return a.fScore < b.fScore ? a : b;
    },
    {
      cameFrom: undefined,
      x: 0,
      y: 0,
      fScore: Number.POSITIVE_INFINITY,
      gScore: Number.POSITIVE_INFINITY,
    }
  );
  if (nextCheapestNode) {
    grid[nextCheapestNode.y][nextCheapestNode.x][1] = CellState.EXPLORING_NEXT;
  }

  return true;
}

export const useAStar = (grid: Grid, options?: AStarOptions) => {
  const opts = buildOptions(options);
  let previousStates: {
    grid: Grid;
    openNodes: ANode[];
    visitedNodes: ANode[];
  }[] = [];
  let _grid: Grid = cloneDeep(grid);
  let openNodes: ANode[] = [];
  let visitedNodes: ANode[] = [];
  let finished = false;

  const _reset = () => {
    finished = false;
    if (previousStates.length > 0) {
      _grid = previousStates[0].grid;
      openNodes = previousStates[0].openNodes;
      visitedNodes = previousStates[0].visitedNodes;
      previousStates = [];
    }
    return cloneDeep(_grid);
  };

  const _previous = () => {
    if (previousStates.length === 0) return undefined;
    const prev = previousStates.pop();
    if (!prev) return undefined;
    _grid = prev.grid;
    openNodes = prev.openNodes;
    visitedNodes = prev.visitedNodes;
    finished = false;
    return cloneDeep(_grid);
  };

  const _next = () => {
    if (finished) {
      console.error("astar finished");
      return undefined;
    }
    previousStates.push({
      grid: cloneDeep(_grid),
      openNodes: cloneDeep(openNodes),
      visitedNodes: cloneDeep(visitedNodes),
    });
    const r = next(_grid, openNodes, visitedNodes, opts);
    if (r === false || typeof r !== "boolean") {
      finished = true;
    }
    return cloneDeep(_grid);
  };

  const _solve = async () => {
    return new Promise<Grid>((resolve) => {
      while (finished !== true) {
        _next();
      }
      resolve(cloneDeep(_grid));
    });
  };

  return {
    reset: _reset,
    previous: _previous,
    next: _next,
    solve: _solve,
  };
};
