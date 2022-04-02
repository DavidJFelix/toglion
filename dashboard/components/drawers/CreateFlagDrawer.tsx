import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react'
import {Controller, useForm} from 'react-hook-form'
import {NewFlag, Organization} from 'types'
import {yupResolver} from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import {useCreateFlag} from 'lib/react-query/api'
import {useRouter} from 'next/router'

const flagSchema = Yup.object({
  name: Yup.string()
    .required('Flag Name is required')
    .min(4, 'Flag name must be at least 4 characters'),
  organizationId: Yup.string()
    .required('Organization id is required')
    .length(26, 'Organization id must be a valid ULID'),
  value: Yup.boolean().required('Flag value is required'),
})

export interface CreateFlagDrawerProps {
  isOpen?: boolean
  onClose: () => void
  organization: Organization
}
export function CreateFlagDrawer({
  isOpen = false,
  onClose,
  organization,
}: CreateFlagDrawerProps) {
  const {control, handleSubmit} = useForm({
    defaultValues: {
      name: '',
      organizationId: organization.id,
      value: false,
      schema: '{"type": "boolean"}',
    },
    resolver: yupResolver(flagSchema),
  })
  const {mutateAsync, isLoading: isSubmitting} = useCreateFlag()
  const {push} = useRouter()

  const wrappedOnClose = () => {
    if (!isSubmitting) {
      return onClose()
    }
    return
  }

  const onSubmit = async (flag: NewFlag) => {
    console.log(flag)
    const newFlag = await mutateAsync(flag)
    push(
      `/o/${encodeURIComponent(organization.name)}/flags/${encodeURIComponent(
        newFlag.name,
      )}`,
    )
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={wrappedOnClose}
      onEsc={wrappedOnClose}
      onOverlayClick={wrappedOnClose}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>New Feature Flag</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4}>
              <Controller
                name="organizationId"
                control={control}
                render={({field: {value, ...field}}) => (
                  <FormControl>
                    <FormLabel htmlFor={field.name}>Organization</FormLabel>
                    <Input {...field} value={organization.name} isDisabled />
                  </FormControl>
                )}
              />
              <Controller
                name="name"
                control={control}
                render={({field, fieldState: {invalid: isInvalid, error}}) => (
                  <FormControl isRequired isInvalid={isInvalid}>
                    <FormLabel htmlFor={field.name}>Name</FormLabel>
                    <Input {...field} placeholder="Flag name" />
                    {error ? (
                      <FormErrorMessage>{error.message}</FormErrorMessage>
                    ) : (
                      <FormHelperText>
                        Name of the flag, unique within the organization
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="value"
                control={control}
                render={({
                  field: {value, ...field},
                  fieldState: {invalid: isInvalid},
                }) => (
                  <FormControl isRequired>
                    <FormLabel htmlFor={field.name}>Value</FormLabel>
                    <HStack>
                      <Switch
                        isChecked={value}
                        {...field}
                        isInvalid={isInvalid}
                      />
                      <Text>({value ? 'true' : 'false'})</Text>
                    </HStack>
                  </FormControl>
                )}
              />
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
              type="submit"
            >
              Create flag
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </form>
    </Drawer>
  )
}
