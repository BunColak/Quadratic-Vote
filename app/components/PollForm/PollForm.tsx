import { Form, useActionData, useTransition } from '@remix-run/react'
import React, { useState } from 'react'
import { z } from 'zod'
import type { action as createAction } from '~/routes/create';
import type { PollEditLoaderData } from '~/routes/poll/$pollId/edit';
import { TextField } from './TextField';

type PollFormProps = {
  poll?: PollEditLoaderData['poll']
  isLoggedIn?: boolean
}

export const pollFormSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  initialCredits: z.preprocess(val => Number(val), z.number().min(0).int("Initial Credits should be an integer")),
  options: z.array(z.object({
    id: z.preprocess(val => Number(val), z.number().nullable().optional()).optional(),
    text: z.string().min(2)
  })).min(2),
  authorName: z.string().optional().nullable()
})

export const PollForm: React.FC<PollFormProps> = ({ poll, isLoggedIn = false }) => {
  const transition = useTransition()
  const actionData = useActionData<typeof createAction>();
  const [questionCount, setQuestionCount] = useState(poll?.options.length || 4);

  const addQuestion = () => setQuestionCount((r) => r + 1);

  const removeQuestion = () => setQuestionCount((r) => r - 1);

  return (
    <Form
      className="container flex flex-col max-w-3xl p-4 pb-4 mx-auto space-y-4"
      method="post"
      action={poll ? `/poll/${poll.id}/edit` : '/create'}
    >
      <div className="w-full prose prose-p:mb-0">
        <h1 className="my-8 text-center capitalize">
          {poll ? `Editing poll ${poll.title}` : 'Create a New Poll'}
        </h1>
        <div className="w-full p-4 bg-red-300" hidden={!actionData?.errors?.formErrors.length}>
          <h2>{actionData?.errors?.formErrors.join(',')}</h2>
        </div>
        {poll || isLoggedIn ? null : <TextField
          name="authorName"
          label='Your Name'
          error={actionData?.errors.fieldErrors.authorName?.join(',')}
          attr={{ required: true }}
        />}
        <TextField
          name="title"
          label='Title'
          error={actionData?.errors.fieldErrors.title?.join(',')}
          attr={{ required: true }}
          defaultValue={poll?.title}
        />
        <TextField
          name="description"
          multiline
          label='Description'
          error={actionData?.errors.fieldErrors.description?.join(',')}
          defaultValue={poll?.description}
        />
        <TextField
          name='initialCredits'
          label="Initial Credits"
          type='number'
          error={actionData?.errors.fieldErrors.initialCredits?.join(',')}
          defaultValue={poll?.initialCredits}
        />
        {[...Array(questionCount)].map((_, i) => <div key={i}>
          {poll ? <input hidden name={`options[${i}][id]`} defaultValue={poll?.options[i] ? poll?.options[i].id : null} /> : null}
          <TextField
            name={`options[${i}][text]`}
            label={`Option ${i + 1}`}
            error={actionData?.errors.fieldErrors.options?.join(',')}
            defaultValue={poll?.options[i] ? poll?.options[i]?.text : ''}
          />
        </div>)}
        <div className="flex space-x-2">
          <button
            type="button"
            className="flex-grow uppercase btn bg-primary text-secondary3"
            onClick={addQuestion}
            disabled={transition.state == 'loading'}
          >
            Add Question
          </button>
          <button
            type="button"
            className="flex-grow uppercase btn bg-primary text-secondary3"
            onClick={removeQuestion}
            hidden={questionCount < 2}
            disabled={transition.state == 'loading'}
          >
            Remove Question
          </button>
        </div>
        <button
          disabled={transition.state == 'loading'}
          className="w-full mt-4 uppercase btn bg-accent2" type="submit">
          {poll ? 'Edit' : 'Create'} Poll
        </button>
      </div>
    </Form>
  )
}