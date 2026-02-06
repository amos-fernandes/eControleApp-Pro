import React, { useState } from "react";
import { View, Image, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { TextBold, Text } from "@/app/UpdateServicesOrder/styles";
import { Button } from "@/components/GlobalStyles/styles";
import { TextButton } from "@/components/GlobalStyles/styles";

interface ImageUploaderProps {
  onImageSelected: (imageUri: string) => void;
  selectedImage?: string | null;
  onRemoveImage?: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  selectedImage,
  onRemoveImage,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    setIsLoading(true);
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permissão Negada",
          "Precisamos de permissão para acessar a galeria de imagens"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Erro ao selecionar imagem:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao selecionar a imagem. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    setIsLoading(true);
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permissão Negada",
          "Precisamos de permissão para acessar a câmera"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Erro ao tirar foto:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao tirar a foto. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    if (onRemoveImage) {
      onRemoveImage();
    }
  };

  return (
    <View style={{ marginTop: 20 }}>
      <TextBold>Selecionar Imagem</TextBold>
      <Text style={{ marginBottom: 10 }}>
        Selecione uma imagem da galeria ou tire uma foto para associar à ordem de serviço
      </Text>

      {selectedImage ? (
        <View style={{ marginBottom: 10 }}>
          <Image
            source={{ uri: selectedImage }}
            style={{ width: "100%", height: 200, borderRadius: 8 }}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <Button
              style={{ flex: 1, marginRight: 5 }}
              onPress={pickImage}
              disabled={isLoading}
            >
              <TextButton>Trocar Imagem</TextButton>
            </Button>
            <Button
              style={{ flex: 1, marginLeft: 5 }}
              onPress={handleRemoveImage}
              disabled={isLoading}
            >
              <TextButton>Remover</TextButton>
            </Button>
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Button
            style={{ flex: 1, marginRight: 5 }}
            onPress={pickImage}
            disabled={isLoading}
          >
            <TextButton>Selecionar da Galeria</TextButton>
          </Button>
          <Button
            style={{ flex: 1, marginLeft: 5 }}
            onPress={takePhoto}
            disabled={isLoading}
          >
            <TextButton>Tirar Foto</TextButton>
          </Button>
        </View>
      )}
    </View>
  );
};

export default ImageUploader;
