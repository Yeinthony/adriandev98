import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    tags: z.array(
      z.object({
        name: z.string(),
        icon: z.string(),
        color: z.string(),
      })
    ),
    accent: z.string(),
    liveUrl: z.string().default(''),
    repoUrl: z.string().default(''),
    featured: z.boolean().default(false),
    stats: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      )
      .optional(),
    role: z.string().optional(),
    challenges: z.array(z.string()).optional(),
    learnings: z.array(z.string()).optional(),
    contributions: z.array(z.string()).optional(),
  }),
});

export const collections = { projects };
