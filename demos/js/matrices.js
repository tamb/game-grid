import { tileTypeEnum } from "./enums.js";

export const matrix2 = [
  [
    {
      type: tileTypeEnum.OPEN,
    },
    {
      type: tileTypeEnum.INTERACTIVE,
      cellAttributes: [['data-cell-type', 'interactive']],
    },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.OPEN,
    },
    {
      type: tileTypeEnum.INTERACTIVE,
    },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.OPEN,
    },
    {
      type: tileTypeEnum.INTERACTIVE,
    },
    { type: tileTypeEnum.OPEN },
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },

    {
      type: tileTypeEnum.BARRIER,
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },

    {
      type: tileTypeEnum.BARRIER,
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },

    {
      type: tileTypeEnum.BARRIER,
    },
  ],
  [
    {
      type: tileTypeEnum.BARRIER,
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.BARRIER,
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.BARRIER,
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
  [
    {
      type: tileTypeEnum.OPEN,
    },
    {
      type: tileTypeEnum.INTERACTIVE,
      cellAttributes: [['data-cell-type', 'interactive']],
    },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.OPEN,
    },
    {
      type: tileTypeEnum.INTERACTIVE,
    },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.OPEN,
    },
    {
      type: tileTypeEnum.INTERACTIVE,
    },
    { type: tileTypeEnum.OPEN },
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },

    {
      type: tileTypeEnum.BARRIER,
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },

    {
      type: tileTypeEnum.BARRIER,
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },

    {
      type: tileTypeEnum.BARRIER,
    },
  ],
  [
    {
      type: tileTypeEnum.BARRIER,
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.BARRIER,
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
    {
      type: tileTypeEnum.BARRIER,
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
];
