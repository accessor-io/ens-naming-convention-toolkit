#!/usr/bin/env node

import { createInterface } from 'readline';
import { spawn } from 'child_process';
import chalk from 'chalk';

const primary = chalk.hex('#5E60CE');
const accent = chalk.hex('#64DFDF');
const accentAlt = chalk.hex('#6930C3');
const muted = chalk.hex('#adb5bd');

function run(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true });
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited with code ${code}`))
    );
  });
}

function banner() {
  if (!process.stdout.isTTY) return;
  const lines = [
    `${accent('EVMD TOOLKIT')} ${muted('• ENS Ops, Fast')}`,
    `${accentAlt('⊱')} ${muted('discover  •  analyze  •  orchestrate')} ${accentAlt('⊰')}`,
  ];
  console.log('\n' + lines.join('\n') + '\n');
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((res) => rl.question(q, res));

  const menu = () => {
    const bullet = chalk.hex('#56CFE1')('◆');
    const divider = muted('──────────────────────────────────────');
    return [
      divider,
      `${bullet} ${accent('1)')} ${primary('ENS Prober')} ${muted('• interactive console')}`,
      `${bullet} ${accent('2)')} ${primary('ENS Prober: addresses')} ${muted('• stream + export')}`,
      `${bullet} ${accent('3)')} ${primary('ENS Prober: analyze')} ${muted('• full resolver audit')}`,
      `${bullet} ${accent('4)')} ${primary('Subdomain Planner')} ${muted('• guided hierarchy')}`,
      `${bullet} ${accent('5)')} ${primary('Exit')} ${muted('• close toolkit')}`,
      divider,
    ].join('\n');
  };

  try {
    while (true) {
      banner();
      console.log(menu());
      const choice = (await ask(accent('\nSelect an option (1-5): '))).trim();
      if (choice === '1') {
        await run('ens-prober');
      } else if (choice === '2') {
        await run('ens-prober', ['addresses']);
      } else if (choice === '3') {
        await run('ens-prober', ['analyze']);
      } else if (choice === '4') {
        await run('ens-planner', ['--interactive']);
      } else if (choice === '5') {
        break;
      } else {
        console.log('Invalid selection.');
      }
    }
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
