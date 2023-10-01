import * as math from "mathjs";
const repr = "dense";


const rho0 = math.matrix([
  [0.5, 0, 0, 0.5],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0.5, 0, 0, 0.5],
]);

const rho1 = math.matrix([
  [0.5, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0.5],
]);

const a1 = 2 ** (-1 / 2);
const s = math.sin(math.pi / 8);
const c = math.cos(math.pi / 8);

const A0_basis = [[[1.0, 0.0]], [[0.0, 1.0]]];
const A1_basis = [[[a1, a1]], [[a1, -a1]]];
const B0_basis = [[[c, s]], [[-s, c]]];
const B1_basis = [[[c, -s]], [[s, c]]];

const A0_projectors = A0_basis.map((v) => {
  const proj = math.multiply(
    math.transpose(math.matrix(v, repr)),
    math.matrix(v, repr),
  );
  return proj;
});

const A1_projectors = A1_basis.map((v) => {
  const proj = math.multiply(
    math.transpose(math.matrix(v, repr)),
    math.matrix(v, repr),
  );
  return proj;
});

const B0_projectors = B0_basis.map((v) => {
  const proj = math.multiply(
    math.transpose(math.matrix(v, repr)),
    math.matrix(v, repr),
  );
  return proj;
});

const B1_projectors = B1_basis.map((v) => {
  const proj = math.multiply(
    math.transpose(math.matrix(v, repr)),
    math.matrix(v, repr),
  );
  return proj;
});

const Q0A0_kronproj = A0_projectors.map((p) => {
  return math.kron(p, math.diag([1, 1]));
});

const Q1A0_kronproj = A0_projectors.map((p) => {
    return math.kron(math.diag([1, 1]), p);
  });

const Q0A1_kronproj = A1_projectors.map((p) => {
  return math.kron(p, math.diag([1, 1]));
});

const Q1A1_kronproj = A1_projectors.map((p) => {
    return math.kron(math.diag([1, 1]), p);
  });

const Q1B0_kronproj = B0_projectors.map((p) => {
  return math.kron(math.diag([1, 1]), p);
});

const Q0B0_kronproj = B0_projectors.map((p) => {
    return math.kron(p, math.diag([1, 1]));
});

const Q1B1_kronproj = B1_projectors.map((p) => {
  return math.kron(math.diag([1, 1]), p);
});

const Q0B1_kronproj = B1_projectors.map((p) => {
    return math.kron(p, math.diag([1, 1]));
});

const QA0_kronproj = [Q0A0_kronproj, Q1A0_kronproj]
const QA1_kronproj = [Q0A1_kronproj, Q1A1_kronproj]
const QB0_kronproj = [Q0B0_kronproj, Q1B0_kronproj]
const QB1_kronproj = [Q0B1_kronproj, Q1B1_kronproj]



export default{
    measurement(state: math.Matrix, basis_kp: Array<math.Matrix>) {
        const collapsed_states_prenorm = basis_kp.map((bkp) => {
          return math.multiply(math.multiply(bkp, state), bkp);
        });
        const probs = collapsed_states_prenorm.map((mat) => math.trace(mat));
      
        if (Math.random() < probs[0]) {
          return {
            outcome: 0,
            new_state: math.multiply(collapsed_states_prenorm[0], probs[0] ** -1),
          };
        } else {
          return {
            outcome: 1,
            new_state: math.multiply(collapsed_states_prenorm[1], probs[1] ** -1),
          };
        }
      },
      QA0_kronproj, QA1_kronproj, QB0_kronproj, QB1_kronproj, rho0, rho1
}