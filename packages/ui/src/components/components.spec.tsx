import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Input } from './input';
import { Skeleton } from './skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

describe('UI Primitives (Design Pro Max)', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Button', () => {
    it('renders default button and triggers click handler', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const btn = screen.getByRole('button', { name: /click me/i });
      expect(btn).toBeDefined();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders with destructive and outline variants', () => {
      render(
        <div>
          <Button variant="destructive">Delete</Button>
          <Button variant="outline">Cancel</Button>
          <Button variant="secondary">Back</Button>
        </div>,
      );

      expect(screen.getByRole('button', { name: /delete/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /back/i })).toBeDefined();
    });

    it('disables button interaction when disabled prop is true', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>,
      );

      const btn = screen.getByRole('button', { name: /disabled/i });
      expect((btn as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Input', () => {
    it('renders text input with accessible focus and handles changes', () => {
      const handleChange = vi.fn();
      render(<Input placeholder="Property Name" onChange={handleChange} />);

      const input = screen.getByPlaceholderText('Property Name');
      fireEvent.change(input, { target: { value: 'Highland Oaks' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Card', () => {
    it('renders Card with header, title, description, content, and footer', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Unit 101</CardTitle>
            <CardDescription>2 Bedroom / 2 Bath</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Rent: $1,800/month</p>
          </CardContent>
          <CardFooter>
            <button type="button">Action</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText('Unit 101')).toBeDefined();
      expect(screen.getByText('2 Bedroom / 2 Bath')).toBeDefined();
      expect(screen.getByText('Rent: $1,800/month')).toBeDefined();
      expect(screen.getByText('Action')).toBeDefined();
    });
  });

  describe('Badge', () => {
    it('renders badge with status variants', () => {
      render(
        <div>
          <Badge variant="default">Active</Badge>
          <Badge variant="success">Occupied</Badge>
          <Badge variant="destructive">Late</Badge>
          <Badge variant="secondary">Vacant</Badge>
          <Badge variant="outline">Draft</Badge>
        </div>,
      );

      expect(screen.getByText('Active')).toBeDefined();
      expect(screen.getByText('Occupied')).toBeDefined();
      expect(screen.getByText('Late')).toBeDefined();
      expect(screen.getByText('Vacant')).toBeDefined();
      expect(screen.getByText('Draft')).toBeDefined();
    });
  });

  describe('Table', () => {
    it('renders accessible semantic data table', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Units</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Apex Heights</TableCell>
              <TableCell>24</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      expect(screen.getByRole('table')).toBeDefined();
      expect(screen.getByText('Apex Heights')).toBeDefined();
      expect(screen.getByText('24')).toBeDefined();
    });
  });

  describe('Skeleton', () => {
    it('renders layout-stable skeleton placeholder', () => {
      render(<Skeleton data-testid="skeleton-box" className="h-6 w-32" />);
      const skeleton = screen.getByTestId('skeleton-box');
      expect(skeleton.className).toContain('animate-pulse');
    });
  });

  describe('Dialog', () => {
    it('renders dialog trigger and content when open', () => {
      render(
        <Dialog open={true}>
          <DialogTrigger asChild>
            <Button>Open Modal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Space</DialogTitle>
              <DialogDescription>Add a rentable space</DialogDescription>
            </DialogHeader>
            <div>Dialog Body</div>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByText('New Space')).toBeDefined();
      expect(screen.getByText('Add a rentable space')).toBeDefined();
      expect(screen.getByText('Dialog Body')).toBeDefined();
    });
  });
});
