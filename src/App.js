import react from "react";
import "./App.css";
import {
  ForceGraph2D,
  ForceGraph3D,
  ForceGraphVR,
  ForceGraphAR,
} from "react-force-graph";
import { data } from "./data";
const NODE_R = 8;
function App() {
  const [state, setState] = react.useState({
    nodes: [],
    links: [],
  });
  const [highlightNodes, setHighlightNodes] = react.useState(new Set());
  const [highlightLinks, setHighlightLinks] = react.useState(new Set());
  const [hoverNode, setHoverNode] = react.useState(null);
  const ref = react.useRef();
  react.useEffect(() => {
    const node = [];
    const links = [];
    data.forEach((item) => {
      item.members?.forEach((member) => {
        if (!node.some((n) => n.id === member.din.toString())) {
          node.push({
            id: member.din.toString(),
            name: member.name,
            currentDesignation: member.currentDesignation,
            isOrganization: false,
          });
        }

        links.push({
          source: member.din.toString(),
          target: item.organization?.cin.toString(),
        });
      });
      node.push({
        id: item.organization.cin.toString(),
        name: item.organization.name,
        isOrganization: true,
        status: item.organization.status,
      });
    });
    // const neighbors = node.map((item) => {
    //   const neigh = [];
    //   let newNeigh = [];
    //   links.forEach((links) => {
    //     if (links.source === item.id) {
    //       neigh.push(links.target);
    //     }
    //     if (links.target === item.id) {
    //       neigh.push(links.source);
    //     }
    //     newNeigh = [...new Set(neigh)];
    //   });
    //   return { ...item, ...{ neighbors: newNeigh } };
    // });
    const nodesTemp = [...new Set(node)];
    const linksTemp = [...new Set(links)];

    const gData = {
      nodes: nodesTemp,
      links: linksTemp,
    };
    gData.links.forEach((link) => {
      const a = gData.nodes.filter((item) => item.id === link.source)[0];
      const b = gData.nodes.filter((item) => item.id === link.target)[0];
      !a.neighbors && (a.neighbors = []);
      !b.neighbors && (b.neighbors = []);
      a.neighbors.push(b);
      b.neighbors.push(a);

      !a.links && (a.links = []);
      !b.links && (b.links = []);
      a.links.push(link);
      b.links.push(link);
    });
    setState(gData);
  }, []);

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  const handleNodeCanvasObject = react.useCallback(
    (node, ctx, globalScale) => {
      // add ring just for highlighted nodes
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
      if (node.isOrganization) {
        ctx.fillStyle = node === hoverNode ? "red" : "orange";
      } else {
        ctx.fillStyle = node === hoverNode ? "green" : "blue";
      }

      ctx.fill();
      const label = node.name;
      const fontSize = node.isOrganization
        ? 14 / (globalScale * 2)
        : 14 / (globalScale * 1.5);
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black"; //node.color;

      // console.log();
      const lineHeight = fontSize * 1.2;
      const lines = label.split(",");
      let x = node.x;
      let y = node.y - lineHeight;
      for (let i = 0; i < lines.length; ++i) {
        ctx.fillText(lines[i], x, y);
        y += lineHeight;
      }
    },
    [hoverNode]
  );
  const handleNodeClick = (node) => {
    console.log("[[[[[[[[[[[[", node);
    ref.current.zoom(3.5, 400);
    ref.current.centerAt(node.x, node.y, 400);
    // highlightNodes.clear();
    // highlightLinks.clear();
    if (node && !highlightNodes.has(node)) {
      highlightNodes.add(node);
      node.neighbors.forEach((neighbor) => highlightNodes.add(neighbor));
      node.links.forEach((link) => highlightLinks.add(link));
    } else {
      highlightNodes.delete(node);
      node.neighbors.forEach((neighbor) => highlightNodes.delete(neighbor));
      node.links.forEach((link) => highlightLinks.delete(link));
    }
    console.log("---------", highlightNodes);
    setHoverNode(node || null);
    updateHighlight();
  };

  return (
    <div className="App">
      <ForceGraph2D
        ref={ref}
        graphData={state}
        width={window.innerWidth}
        height={650}
        nodeRelSize={4}
        linkVisibility={true}
        nodeColor={(node) => (node.isOrganization ? "pink" : "yellow")}
        nodeCanvasObject={handleNodeCanvasObject}
        onNodeClick={handleNodeClick}
        // onLinkHover={handleLinkHover}
        linkWidth={(link) => (highlightLinks.has(link) ? 5 : 1)}
        linkDirectionalParticles={4}
        linkDirectionalParticleWidth={(link) =>
          highlightLinks.has(link) ? 4 : 0
        }
        nodeCanvasObjectMode={(node) =>
          highlightNodes.has(node) ? "after" : undefined
        }
      />
    </div>
  );
}

export default App;
